import sqlite3

def create_tables():
    conn = sqlite3.connect('instance/emr.db')
    cursor = conn.cursor()

    # Create the patients table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dob TEXT NOT NULL,
            gender TEXT,
            blood_type TEXT,
            contact_number TEXT
        )
    ''')

    # Create the clinical notes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
        )
    ''')

    conn.commit()
    conn.close()
    print("Database tables created successfully!")

if __name__ == '__main__':
    create_tables()
