# app.py

import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import openai

# --- CONFIGURATION ---
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///emr.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- SECURE API KEY CONFIGURATION ---
openai.api_key = os.getenv("OPENAI_API_KEY")

# --- DATABASE MODELS ---
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dob = db.Column(db.String(20), nullable=False)
    notes = db.relationship('Note', backref='patient', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "dob": self.dob,
            "notes": [note.to_dict() for note in self.notes]
        }

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)

    def to_dict(self):
        return {"id": self.id, "content": self.content}

# --- CUSTOM ERROR HANDLERS ---
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not Found"}), 404

# --- API ENDPOINTS ---

@app.route('/api/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.all()
    return jsonify([patient.to_dict() for patient in patients])

@app.route('/api/patients', methods=['POST'])
def create_patient():
    data = request.json
    if not data or 'name' not in data or 'dob' not in data:
        return jsonify({"error": "Missing required fields: name and dob"}), 400
    if not isinstance(data['name'], str) or not data['name'].strip():
        return jsonify({"error": "Name must be a non-empty string"}), 400
    if not isinstance(data['dob'], str) or not data['dob'].strip():
        return jsonify({"error": "Date of Birth must be a non-empty string"}), 400
    new_patient = Patient(name=data['name'].strip(), dob=data['dob'])
    db.session.add(new_patient)
    db.session.commit()
    return jsonify(new_patient.to_dict()), 201

@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient_details(patient_id):
    patient = db.get_or_404(Patient, patient_id)
    return jsonify(patient.to_dict())

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    # This is the corrected version that uses modern SQLAlchemy and does NOT use get_db_connection
    patient_to_delete = db.get_or_404(Patient, patient_id)

    try:
        db.session.delete(patient_to_delete)
        db.session.commit()
        return jsonify({"message": f"Patient with ID {patient_id} deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/patients/<int:patient_id>/notes', methods=['POST'])
def add_note(patient_id):
    patient = db.get_or_404(Patient, patient_id)
    data = request.json
    if not data or 'content' not in data:
        return jsonify({"error": "Missing required field: content"}), 400
    if not isinstance(data['content'], str) or not data['content'].strip():
        return jsonify({"error": "Content must be a non-empty string"}), 400
    new_note = Note(content=data['content'].strip(), patient_id=patient.id)
    db.session.add(new_note)
    db.session.commit()
    return jsonify(new_note.to_dict()), 201

@app.route('/api/patients/<int:patient_id>/summary', methods=['GET'])
def get_summary(patient_id):
    if not openai.api_key:
        return jsonify({"error": "OpenAI API key is not configured on the server."}), 500
    patient = db.get_or_404(Patient, patient_id)
    if not patient.notes:
        return jsonify({"summary": "No notes available to generate a summary."})
    all_notes_text = "\n".join([note.content for note in patient.notes])
    prompt = f"Summarize the following clinical notes for a patient into a concise, easy-to-read summary for a doctor. Focus on key diagnoses, medications, and recent changes. Format it with bullet points.\n\nPATIENT NOTES:\n---\n{all_notes_text}\n---\n\nSUMMARY:"
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful medical assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )
        summary = response.choices[0].message.content.strip()
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": f"An error occurred with the AI service: {str(e)}"}), 500

# --- DATABASE SETUP COMMAND ---
@app.cli.command("init-db")
def init_db_command():
    """Creates the database tables."""
    db.create_all()
    print("Initialized the database.")