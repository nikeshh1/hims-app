## Lab Reports Data Fetch Troubleshooting Guide

### 🔍 Quick Diagnostics

Check your app console (F12) or React Native debugger for these logs:

1. **Look for API request log:**
   ```
   🌐 REQUEST: {
     method: "GET",
     url: "/laboratories",
     fullURL: "http://192.168.31.244:8000/api/laboratories"
   }
   ```

2. **Look for response:**
   - ✅ If you see `✅ RESPONSE: { status: 200, ... }`
   - ❌ If you see `❌ RESPONSE ERROR: { status: 404 or 500, ... }`

---

### ✅ What To Check

#### 1. Is Your Backend Running?
```bash
# On your backend machine, check if Laravel is running
cd C:\xampp\htdocs\Himss-web\login
composer run dev

# Should show: "Server running on [http://127.0.0.1:8000]"
```

#### 2. Is the API Endpoint Configured?
- Login to Laravel and check routes:
  ```bash
  php artisan route:list | grep laboratories
  ```
  Should show: `GET /api/laboratories`

#### 3. Check Your API Host in Frontend
- File: `src/config/api.ts`
- Current: `http://192.168.31.244:8000`
- **Does this match your backend's IP?** (Run `ipconfig` on backend machine)
- **Is your device on the same network?**

#### 4. Network Connectivity
- Try accessing directly in browser:
  ```
  http://192.168.31.244:8000/api/laboratories
  ```
- Should return JSON response (may be empty array if no data exists)

---

### 📝 Expected API Response Format

The backend should return:
```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "patient_id": "patient-uuid",
      "patient": {
        "first_name": "Rahul",
        "last_name": "Kumar",
        "patient_code": "PAT001"
      },
      "test_type": "Blood Test",
      "test_name": "Complete Blood Count",
      "sample_id": "SMP-001",
      "status": "Completed",
      "result_data": {
        "observations": "normal",
        "findings": "WBC normal",
        "diagnosis": "No abnormality"
      },
      "created_at": "2026-04-21T10:30:00"
    }
  ]
}
```

---

### 🛠️ Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| Shows "-" for patient name | API not returning patient data or empty response | Check backend API response structure |
| Error 404 | Endpoint doesn't exist | Create `/api/laboratories` route in Laravel |
| Error 500 | Backend error | Check Laravel logs: `storage/logs/laravel.log` |
| No data showing | Network connectivity | Check IP address, ensure same network |
| Forever loading | Request timeout | Check API timeout settings, network speed |

---

### 🧪 Test the Endpoint Manually

Use Postman or similar:

**GET** `http://192.168.31.244:8000/api/laboratories`

**Headers:**
```
Accept: application/json
Content-Type: application/json
```

---

### 📱 Check App Logs

Open React Native debugger:
1. Press `Ctrl+M` (Android) or `Cmd+D` (iOS)
2. Select "Debug"
3. Open Chrome DevTools (F12)
4. Go to Console tab
5. Look for logs starting with:
   - 🌐 REQUEST
   - ✅ RESPONSE
   - ❌ RESPONSE ERROR
   - 📡 Fetching lab reports
   - ✅ Fetched X lab reports
   - ❌ Failed to fetch lab reports

---

### 💾 Sample Test Data SQL

If backend has no data, insert test data:

```sql
INSERT INTO patients (id, first_name, last_name, patient_code) VALUES 
('pat-001', 'Rahul', 'Kumar', 'PAT001');

INSERT INTO lab_reports (id, patient_id, test_type, test_name, sample_id, status, result_data, created_at) VALUES 
('lab-001', 'pat-001', 'Blood Test', 'Complete Blood Count', 'SMP-001', 'Completed', 
 JSON_OBJECT('observations', 'normal', 'findings', 'WBC normal', 'diagnosis', 'No abnormality'), NOW());
```
