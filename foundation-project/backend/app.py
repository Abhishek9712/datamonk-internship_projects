import os, sqlite3, boto3
from flask import Flask, request, jsonify, send_file, abort
from flask_cors import CORS  # Add this import
from werkzeug.utils import secure_filename
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

DB = os.getenv("DB_PATH", "/data/files.db")
S3_BUCKET = os.getenv("S3_BUCKET")
s3 = boto3.client('s3')

def init_db():
    with sqlite3.connect(DB) as conn:
        conn.execute('CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY, filename TEXT, s3_key TEXT)')
        conn.commit()
init_db()

@app.route('/api/files', methods=['GET'])
def list_files():
    with sqlite3.connect(DB) as conn:
        rows = conn.execute('SELECT id, filename FROM files').fetchall()
    return jsonify([{"id": r[0], "filename": r[1]} for r in rows])

@app.route('/api/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file part"}), 400
    filename = secure_filename(file.filename)
    s3_key = f"uploads/{filename}"
    s3.upload_fileobj(file, S3_BUCKET, s3_key)
    with sqlite3.connect(DB) as conn:
        conn.execute('INSERT INTO files (filename, s3_key) VALUES (?, ?)', (filename, s3_key))
    return jsonify({"message": "File uploaded", "filename": filename}), 201

@app.route('/api/download/<int:file_id>', methods=['GET'])
def download(file_id):
    with sqlite3.connect(DB) as conn:
        row = conn.execute('SELECT filename, s3_key FROM files WHERE id = ?', (file_id,)).fetchone()
    if not row:
        return abort(404)
    fileobj = BytesIO()
    s3.download_fileobj(S3_BUCKET, row[1], fileobj)
    fileobj.seek(0)
    return send_file(fileobj, download_name=row[0], as_attachment=True)

@app.route('/api/delete/<int:file_id>', methods=['DELETE'])
def delete(file_id):
    with sqlite3.connect(DB) as conn:
        row = conn.execute('SELECT filename, s3_key FROM files WHERE id = ?', (file_id,)).fetchone()
        if not row:
            return jsonify({"error": "Not found"}), 404
        conn.execute('DELETE FROM files WHERE id = ?', (file_id,))
    s3.delete_object(Bucket=S3_BUCKET, Key=row[1])
    return jsonify({"message": f"Deleted {row[0]}"}), 200

# Add a simple health check
@app.route('/api', methods=['GET'])
def health_check():
    return jsonify({"status": "Backend is running!", "message": "Google Drive Clone API"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
