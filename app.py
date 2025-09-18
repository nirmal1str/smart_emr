# app.py

import os
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
import openai

# --- CONFIGURATION ---
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///emr.db' # This creates the DB file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- AI CONFIGURATION (IMPORTANT!) ---
# Get the API key from your teammate (Person 3) and paste it here.
# It starts with "sk-..." or "gsk_..."
openai.api_key = "PASTE_THE_OPENAI_API_KEY_HERE"

# --- DATABASE MODELS ---
# This is the Python blueprint for your database tables.
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dob = db.Column(db.String(20), nullable=False)
    notes = db.relationship('Note', backref='patient', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        """Helper function to convert a patient object into a dictionary."""
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
        """Helper function to convert a note object into a dictionary."""
        return {"id": self.id, "content": self.content}


# --- HTML PAGE ROUTES ---
# These two routes just serve the HTML files your frontend teammate will build.
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/patient/<int:patient_id>')
def patient_page(patient_id):
    return render_template('patient.html', patient_id=patient_id)


# --- CORE API ENDPOINTS ---
# These are the "actions" your frontend will call.

@app.route('/api/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.all()
    return jsonify([patient.to_dict() for patient in patients])

@app.route('/api/patients', methods=['POST'])
def create_patient():
    data = request.json
    new_patient = Patient(name=data['name'], dob=data['dob'])
    db.session.add(new_patient)
    db.session.commit()
    return jsonify(new_patient.to_dict()), 201

@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient_details(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    return jsonify(patient.to_dict())

@app.route('/api/patients/<int:patient_id>/notes', methods=['POST'])
def add_note(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    data = request.json
    new_note = Note(content=data['content'], patient_id=patient.id)
    db.session.add(new_note)
    db.session.commit()
    return jsonify(new_note.to_dict()), 201


# --- THE "SMART" AI ENDPOINT ---
@app.route('/api/patients/<int:patient_id>/summary', methods=['GET'])
def get_summary(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    if not patient.notes:
        return jsonify({"summary": "No notes available to generate a summary."})

    all_notes_text = "\n".join([note.content for note in patient.notes])

    prompt = f"""
    Summarize the following clinical notes for a patient into a concise, easy-to-read summary for a doctor.
    Focus on key diagnoses, medications, and recent changes. Format it with bullet points.

    PATIENT NOTES:
    ---
    {all_notes_text}
    ---

    SUMMARY:
    """

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
        return jsonify({"error": str(e)}), 500


# --- BOILERPLATE TO RUN THE APP ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)