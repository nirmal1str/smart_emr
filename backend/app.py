from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import sqlite3
from openai import OpenAI
import json

# Load environment variables from .env file
load_dotenv()
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

# Create the Flask application instance
app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Backend is running!"

# Configure Perplexity client
perplexity_client = None
if PERPLEXITY_API_KEY:
    perplexity_client = OpenAI(
        api_key=PERPLEXITY_API_KEY,
        base_url="https://api.perplexity.ai"
    )
else:
    print("Warning: PERPLEXITY_API_KEY not found in environment variables.")

# Function to get a database connection
def get_db_connection():
    conn = sqlite3.connect('instance/emr.db')
    conn.row_factory = sqlite3.Row
    return conn

# -------------------- PATIENT ROUTES --------------------

# Get all patients
@app.route('/api/patients', methods=['GET'])
def get_all_patients():
    conn = get_db_connection()
    patients = conn.execute('SELECT * FROM patients').fetchall()
    conn.close()
    return jsonify([dict(patient) for patient in patients])

# Get single patient details + notes
@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient_details(patient_id):
    conn = get_db_connection()
    patient = conn.execute('SELECT * FROM patients WHERE id = ?', (patient_id,)).fetchone()
    notes = conn.execute('SELECT * FROM notes WHERE patient_id = ?', (patient_id,)).fetchall()
    conn.close()
    
    if patient is None:
        return jsonify({"error": "Patient not found"}), 404
        
    patient_dict = dict(patient)
    patient_dict['notes'] = [dict(note) for note in notes]
    
    return jsonify(patient_dict)

# Create a patient
@app.route('/api/patients', methods=['POST'])
def create_patient():
    new_patient = request.json
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO patients (name, dob, gender, blood_type, contact_number)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            new_patient['name'],
            new_patient['dob'],
            new_patient['gender'],
            new_patient['blood_type'],
            new_patient['contact_number']
        ))
        conn.commit()
        
        patient_id = cursor.lastrowid
        
        return jsonify({
            'id': patient_id,
            'message': 'Patient created successfully'
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()

# Add a new clinical note
@app.route('/api/patients/<int:patient_id>/notes', methods=['POST'])
def add_note(patient_id):
    new_note = request.json
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO notes (patient_id, content, timestamp)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        ''', (patient_id, new_note['content']))
        conn.commit()
        note_id = cursor.lastrowid
        return jsonify({
            'id': note_id,
            'content': new_note['content']
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()

# Delete a patient + their notes
@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
        cursor.execute("DELETE FROM notes WHERE patient_id = ?", (patient_id,))
        conn.commit()
        return jsonify({"message": f"Patient with ID {patient_id} and all notes deleted successfully."}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# Delete a single note
@app.route('/api/patients/<int:patient_id>/notes/<int:note_id>', methods=['DELETE'])
def delete_note(patient_id, note_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM notes WHERE id = ? AND patient_id = ?", (note_id, patient_id))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Note not found or does not belong to the patient."}), 404
        return jsonify({"message": f"Note with ID {note_id} deleted successfully."}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# -------------------- PERPLEXITY AI ROUTES --------------------

# AI Summary
@app.route('/api/patients/<int:patient_id>/summary-perplexity', methods=['GET'])
def get_perplexity_summary(patient_id):
    conn = get_db_connection()
    notes = conn.execute("SELECT content FROM notes WHERE patient_id = ?", (patient_id,)).fetchall()
    conn.close()
    
    if not notes:
        return jsonify({"summary": "No notes found for this patient."}), 200

    notes_text = " ".join([note['content'] for note in notes])
    
    try:
        response = perplexity_client.chat.completions.create(
            model="sonar",   # ✅ Fixed model
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical assistant. Summarize the patient notes to highlight key medical history, conditions, and treatment plans."
                },
                {
                    "role": "user",
                    "content": f"Patient Notes: {notes_text}"
                }
            ],
            temperature=0.5
        )
        return jsonify({"summary": response.choices[0].message.content}), 200
    
    except Exception as e:
        return jsonify({"error": f"AI service error: {str(e)}"}), 500

# Predictive Analysis
@app.route('/api/patients/<int:patient_id>/predictive-analysis-perplexity', methods=['GET'])
def get_perplexity_predictive_analysis(patient_id):
    conn = get_db_connection()
    notes = conn.execute("SELECT content FROM notes WHERE patient_id = ?", (patient_id,)).fetchall()
    conn.close()
    
    if not notes:
        return jsonify({"error": "No notes found for this patient to analyze."}), 400
    
    notes_text = " ".join([note['content'] for note in notes])
    
    try:
        response = perplexity_client.chat.completions.create(
            model="sonar",   # ✅ Fixed model
            messages=[
                {
                    "role": "system",
                    "content": """You are a medical AI. Analyze the patient's history and provide a JSON object that describes a trend over time for a hypothetical metric like 'Patient Health Score' (1–100). The JSON must contain:
                    - 'labels': array of dates
                    - 'data': array of scores
                    Use at least 5 data points. Respond ONLY with JSON."""
                },
                {
                    "role": "user",
                    "content": f"Patient Notes: {notes_text}"
                }
            ],
            temperature=0.5
        )
        chart_data = response.choices[0].message.content.strip()
        return jsonify({"analysis": json.loads(chart_data)}), 200
    
    except json.JSONDecodeError as e:
        return jsonify({"error": f"AI response was not valid JSON: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"AI service error: {str(e)}"}), 500

# -------------------- RUN APP --------------------

if __name__ == '__main__':
    app.run(debug=True, port=5000)
