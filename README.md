This is the API contract for the Smart EMR backend.

**Base URL:** `/`

# Patients

* **GET `/api/patients`**
    * **Description:** Retrieves a list of all patients.
    * **Success Response (200 OK):**
        ```json
        [
            {
                "id": 1,
                "name": "John Doe",
                "dob": "1990-01-15",
                "notes": []
            }
        ]
        ```

* **POST `/api/patients`**
    * **Description:** Creates a new patient.
    * **Request Body (JSON):**
        ```json
        {
            "name": "Jane Doe",
            "dob": "1992-03-20"
        }
        ```
    * **Success Response (201 Created):** Returns the newly created patient object.
    * **Error Response (400 Bad Request):** If name or dob are missing/empty.

# Notes

* **POST `/api/patients/<patient_id>/notes`**
    * **Description:** Adds a new clinical note for a specific patient.
    * **Request Body (JSON):**
        ```json
        {
            "content": "Patient reports mild headache."
        }
        ```
    * **Success Response (201 Created):** Returns the newly created note object.

* **GET `/api/patients/<patient_id>/summary`**
    * **Description:** Generates an AI-powered summary of all notes for a specific patient.
    * **Success Response (200 OK):**
        ```json
        {
            "summary": "The patient presents with a mild headache..."
        }
        ```