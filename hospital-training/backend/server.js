const express = require("express");
const cors = require("cors");
const db = require("./db");
const path = require("path");

const app = express();
const port = 5050;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("🚀 Server is running!");
});

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, "uploads")); // ← يضمن أنه يروح للمجلد الصح
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});


// إعداد رفع ملف واحد فقط باسم `attachment`
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // ✅ يقبل أي نوع من الملفات
    console.log("📥 Received file:", file.originalname, "| Type:", file.mimetype);
    cb(null, true);
  }
});




app.get("/floors", (req, res) => {
  const query = "SELECT * FROM Floors";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});


app.get("/Technical", (req, res) => {
  const query = "SELECT * FROM Engineers";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});



app.get("/TypeProplem", (req, res) => {
  const query = "SELECT * FROM DeviceType";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.get("/problem-states/pc", (req, res) => {
  db.query("SELECT * FROM ProblemStates_Pc", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.get("/problem-states/printer", (req, res) => {
  db.query("SELECT * FROM ProblemStates_Printer", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.get("/problem-states/scanner", (req, res) => {
  db.query("SELECT * FROM ProblemStates_Scanner", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.get("/problem-states/maintenance/:deviceType", (req, res) => {
  const { deviceType } = req.params;

  db.query(
    "SELECT problemStates_Maintance_device_name FROM `problemStates_Maintance_device` WHERE device_type_name = ?",
    [deviceType],
    (err, results) => {
      if (err) {
        console.error("❌ DB Error:", err);
        return res.status(500).json({ error: "DB error" });
      }
      res.json(results);
    }
  );
});


app.get("/Departments", (req, res) => {
  const query = "SELECT * FROM Departments  ORDER BY name ASC ";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});




app.get("/CPU_Types", (req, res) => {
  const query = "SELECT * FROM CPU_Types";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});


app.get("/RAM_Types", (req, res) => {
  const query = "SELECT * FROM RAM_Types";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.get("/OS_Types", (req, res) => {
  const query = "SELECT * FROM OS_Types";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});


app.get("/Processor_Generations", (req, res) => {
  const query = "SELECT * FROM Processor_Generations";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});


app.get("/PC_Model", (req, res) => {
  const query = "SELECT * FROM PC_Model";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});


app.get("/Scanner_Model", (req, res) => {
  const query = "SELECT * FROM Scanner_Model";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.get("/Printer_Model", (req, res) => {
  const query = "SELECT * FROM Printer_Model";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});



// ✅ GET Devices with ID from Maintenance_Devices

app.get("/devices/:type/:department", (req, res) => {
  const type = req.params.type.toLowerCase();
  const department = req.params.department;

  // جداول info لبعض الأنواع المشهورة
  const tableMap = {
    pc: { table: "PC_info", nameCol: "Computer_Name" },
    printer: { table: "Printer_info", nameCol: "Printer_Name" },
    scanner: { table: "Scanner_info", nameCol: "Scanner_Name" },
  };
  let joinClause = "";
  let nameSelect = "md.device_name AS name";

  if (tableMap[type]) {
    const table = tableMap[type].table;
    const nameCol = tableMap[type].nameCol;

    joinClause = `
      LEFT JOIN ${table} d
      ON md.serial_number = d.Serial_Number
      AND md.governmental_number = d.Governmental_Number
    `;
    nameSelect = `COALESCE(d.${nameCol}, md.device_name) AS name`;
  }


  const sql = `
    SELECT 
      md.id,
      md.serial_number AS Serial_Number,
      md.governmental_number AS Governmental_Number,
      ${nameSelect}
    FROM Maintenance_Devices md
    ${joinClause}
    WHERE md.device_type = ?
      AND md.department_id = (SELECT id FROM Departments WHERE name = ?)
  `;

  db.query(sql, [type, department], (err, result) => {
    if (err) {
      console.error("❌ Error fetching devices:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(result);
  });
});


app.post("/submit-regular-maintenance", async (req, res) => {
  const {
    "maintenance-date": date,
    frequency,
    "device-type": rawDeviceType,
    section,
    "device-spec": deviceSpec,
    details = [],
    notes = ""
  } = req.body;

  try {
    // 1. Get department ID
    const departmentId = await new Promise((resolve, reject) => {
      db.query("SELECT id FROM Departments WHERE name = ?", [section], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]?.id || null);
      });
    });

    // 2. Get device info
    const deviceInfo = await new Promise((resolve, reject) => {
      const query = `
        SELECT md.*, COALESCE(pc.Computer_Name, pr.Printer_Name, sc.Scanner_Name, md.device_name) AS device_name,
               COALESCE(c.cpu_name, '') AS cpu_name,
               COALESCE(r.ram_type, '') AS ram_type,
               COALESCE(o.os_name, '') AS os_name,
               COALESCE(g.generation_number, '') AS generation_number,
               COALESCE(pm.model_name, prm.model_name, scm.model_name, '') AS model_name,
               d.name AS department_name
        FROM Maintenance_Devices md
        LEFT JOIN PC_info pc ON md.device_type = 'PC' AND md.serial_number = pc.Serial_Number AND md.governmental_number = pc.Governmental_Number
        LEFT JOIN Printer_info pr ON md.device_type = 'Printer' AND md.serial_number = pr.Serial_Number AND md.governmental_number = pr.Governmental_Number
        LEFT JOIN Scanner_info sc ON md.device_type = 'Scanner' AND md.serial_number = sc.Serial_Number AND md.governmental_number = sc.Governmental_Number
        LEFT JOIN CPU_Types c ON pc.Processor_id = c.id
        LEFT JOIN RAM_Types r ON pc.RAM_id = r.id
        LEFT JOIN OS_Types o ON pc.OS_id = o.id
        LEFT JOIN Processor_Generations g ON pc.Generation_id = g.id
        LEFT JOIN PC_Model pm ON pc.Model_id = pm.id
        LEFT JOIN Printer_Model prm ON pr.Model_id = prm.id
        LEFT JOIN Scanner_Model scm ON sc.Model_id = scm.id
        LEFT JOIN Departments d ON md.department_id = d.id
        WHERE md.id = ?`;
      db.query(query, [deviceSpec], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });

    if (!deviceInfo) return res.status(404).json({ error: "Device not found" });

    // 3. Insert into Regular_Maintenance (no duplicates check here)
    const checklist = JSON.stringify(details);
    await new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO Regular_Maintenance (
          device_id, device_type, last_maintenance_date, frequency, checklist, notes,
          serial_number, governmental_number, device_name, department_name,
          cpu_name, ram_type, os_name, generation_number, model_name, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          deviceSpec,
          rawDeviceType || deviceInfo.device_type,
          date,
          frequency,
          checklist,
          notes,
          deviceInfo.serial_number,
          deviceInfo.governmental_number,
          deviceInfo.device_name,
          deviceInfo.department_name,
          deviceInfo.cpu_name,
          deviceInfo.ram_type,
          deviceInfo.os_name,
          deviceInfo.generation_number,
          deviceInfo.model_name,
          "Open"
        ],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // 4. Create Ticket
    const ticketNumber = `TIC-${Date.now()}`;
    const ticketId = await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO Internal_Tickets (ticket_number, priority, department_id, issue_description) VALUES (?, ?, ?, ?)",
        [ticketNumber, "Medium", departmentId, `Regular Maintenance for device ${deviceInfo.device_name}`],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId);
        }
      );
    });

    // 5. Check if maintenance report already exists for today
    const alreadyReported = await new Promise((resolve, reject) => {
      db.query(
        `SELECT id FROM Maintenance_Reports 
         WHERE device_id = ? AND maintenance_type = 'Regular' 
         AND DATE(created_at) = CURDATE()`,
        [deviceSpec],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.length > 0);
        }
      );
    });

    if (!alreadyReported) {
      const reportNumberMain = `REP-${Date.now()}-MAIN`;
      await new Promise((resolve, reject) => {
        db.query(
          "INSERT INTO Maintenance_Reports (report_number, ticket_id, device_id, issue_summary, full_description, status, maintenance_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            reportNumberMain,
            ticketId,
            deviceSpec,
            checklist,
            notes || "Routine periodic maintenance performed.",
            "Open",
            "Regular"
          ],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    }

    // 6. Prevent duplicate ticket summary
    const ticketReportExists = await new Promise((resolve, reject) => {
      db.query(
        `SELECT id FROM Maintenance_Reports 
         WHERE device_id = ? AND ticket_id = ? AND issue_summary = 'Ticket Created'`,
        [deviceSpec, ticketId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.length > 0);
        }
      );
    });

    if (!ticketReportExists) {
      const reportNumberTicket = `REP-${Date.now()}-TICKET`;
      await new Promise((resolve, reject) => {
        db.query(
          "INSERT INTO Maintenance_Reports (report_number, ticket_id, device_id, issue_summary, full_description, status, maintenance_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            reportNumberTicket,
            ticketId,
            deviceSpec,
            "Ticket Created",
            `Ticket (${ticketNumber}) for device: ${deviceInfo.device_name} - Department: ${deviceInfo.department_name}`,
            "Open",
            "Regular"
          ],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    }

    res.json({ message: "✅ Regular maintenance, ticket and reports created successfully" });

  } catch (error) {
    console.error("❌ Error in regular maintenance submission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});







// ✅ Endpoint لإضافة الخيارات (Dropdown Options) - GENERAL
app.post("/add-option-general", (req, res) => {
  const { target, value, type } = req.body; // 🟢 Extract values from request

  // 🟢 تحديد الجدول والعمود لكل نوع خيار في القوائم المنسدلة
  const tableMap = {
    "problem-type": { table: "DeviceType", column: "DeviceType" },
    "section": { table: "Departments", column: "name" },
    "floor": { table: "Floors", column: "FloorNum" },
    "technical": { table: "Engineers", column: "name" },
    "problem-status": type === "pc"
      ? { table: "ProblemStates_Pc", column: "problem_text" }
      : type === "printer"
        ? { table: "ProblemStates_Printer", column: "problem_text" }
        : type === "scanner"
          ? { table: "ProblemStates_Scanner", column: "problem_text" }
          : { table: "problemStates_Maintance_device", column: "problemStates_Maintance_device_name", extra: "device_type_name" },
    "os-select": { table: "OS_Types", column: "os_name" },
    "ram-select": { table: "RAM_Types", column: "ram_type" },
    "cpu-select": { table: "CPU_Types", column: "cpu_name" },
    "generation-select": { table: "Processor_Generations", column: "generation_number" }
  };

  const mapping = tableMap[target];
  if (!mapping) return res.status(400).json({ error: "Invalid target field" }); // 🔴 إذا النوع غير موجود نرجع خطأ

  let query = "";
  let params = [];

  if (mapping.extra) {
    query = `INSERT INTO ${mapping.table} (${mapping.column}, ${mapping.extra}) VALUES (?, ?)`;
    params = [value, type];
  } else {
    query = `INSERT INTO ${mapping.table} (${mapping.column}) VALUES (?)`;
    params = [value];
  }

  // 🔍 تحقق من عدم وجود القيمة مسبقًا
  const checkQuery = mapping.extra
    ? `SELECT * FROM ${mapping.table} WHERE ${mapping.column} = ? AND ${mapping.extra} = ?`
    : `SELECT * FROM ${mapping.table} WHERE ${mapping.column} = ?`;

  db.query(checkQuery, params, (err, existing) => {
    if (err) return res.status(500).json({ error: "DB check error" });
    if (existing.length > 0) {
      return res.status(400).json({ error: `⚠️ \"${value}\" already exists in ${mapping.table}` });
    }

    // ✅ إضافة إذا لم تكن موجودة مسبقًا
    db.query(query, params, (err2, result) => {
      if (err2) {
        console.error("❌ DB Insert Error:", err2);
        return res.status(500).json({ error: "Database error while inserting option" });
      }
      res.json({ message: `✅ ${value} added to ${mapping.table}` });
    });
  });
});



app.post("/add-options-external", (req, res) => {
  const { target, value } = req.body;
  if (!target || !value) {
    return res.status(400).json({ error: "Missing target or value" });
  }

  let table = "";
  let column = "";

  switch (target) {
    case "device-type":
      table = "DeviceType";
      column = "DeviceType";
      break;
    case "section":
      table = "Departments";
      column = "name";
      break;
    case "reporter-name":
      table = "Engineers";
      column = "name";
      break;
    default:
      return res.status(400).json({ error: "Unsupported dropdown" });
  }

  // ✅ تحقق أولاً إذا كانت القيمة موجودة مسبقًا
  const checkQuery = `SELECT * FROM ${table} WHERE ${column} = ? LIMIT 1`;
  db.query(checkQuery, [value], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("❌ Error checking existing value:", checkErr);
      return res.status(500).json({ error: "Database error" });
    }

    if (checkResult.length > 0) {
      return res.status(400).json({ error: `⚠️ "${value}" already exists!` });
    }

    // ✅ إذا ما كانت موجودة، أضفها
    const insertQuery = `INSERT INTO ${table} (${column}) VALUES (?)`;
    db.query(insertQuery, [value], (insertErr, insertResult) => {
      if (insertErr) {
        console.error("❌ Error inserting option:", insertErr);
        return res.status(500).json({ error: "Database insert error" });
      }
      res.json({ message: `✅ ${value} added successfully` });
    });
  });
});


app.post("/add-options-regular", (req, res) => {
  const { target, value, type } = req.body; // 🟢 استخراج القيم من الطلب

  // 🟢 تحديد الجدول والعمود لكل نوع خيار في القوائم المنسدلة
  const tableMap = {
    "device-type": { table: "DeviceType", column: "DeviceType" },
    "section": { table: "Departments", column: "name" },
    "os-select": { table: "OS_Types", column: "os_name" },
    "ram-select": { table: "RAM_Types", column: "ram_type" },
    "cpu-select": { table: "CPU_Types", column: "cpu_name" },
    "generation-select": { table: "Processor_Generations", column: "generation_number" },
    "problem-status": type === "pc"
      ? { table: "ProblemStates_Pc", column: "problem_text" }
      : type === "printer"
        ? { table: "ProblemStates_Printer", column: "problem_text" }
        : type === "scanner"
          ? { table: "ProblemStates_Scanner", column: "problem_text" }
          : { table: "problemStates_Maintance_device", column: "problemStates_Maintance_device_name", extra: "device_type_name" },
  };

  const mapping = tableMap[target];
  if (!mapping) return res.status(400).json({ error: "Invalid target field" }); // 🔴 إذا النوع غير موجود نرجع خطأ

  let query = "";
  let params = [];

  if (mapping.extra) {
    query = `INSERT INTO ${mapping.table} (${mapping.column}, ${mapping.extra}) VALUES (?, ?)`;
    params = [value, type];
  } else {
    query = `INSERT INTO ${mapping.table} (${mapping.column}) VALUES (?)`;
    params = [value];
  }

  // 🔍 تحقق من عدم وجود القيمة مسبقًا
  const checkQuery = mapping.extra
    ? `SELECT * FROM ${mapping.table} WHERE ${mapping.column} = ? AND ${mapping.extra} = ?`
    : `SELECT * FROM ${mapping.table} WHERE ${mapping.column} = ?`;

  db.query(checkQuery, params, (err, existing) => {
    if (err) return res.status(500).json({ error: "DB check error" });
    if (existing.length > 0) {
      return res.status(400).json({ error: `⚠️ \"${value}\" already exists in ${mapping.table}` });
    }

    // ✅ إضافة إذا لم تكن موجودة مسبقًا
    db.query(query, params, (err2, result) => {
      if (err2) {
        console.error("❌ DB Insert Error:", err2);
        return res.status(500).json({ error: "Database error while inserting option" });
      }
      res.json({ message: `✅ ${value} added to ${mapping.table}` });
    });
  });
});


app.post("/submit-general-maintenance", async (req, res) => {
  const {
    DeviceType: rawDeviceType,
    DeviceID: deviceSpec,
    Section: section,
    Floor: floor,
    ProblemStatus: problemStatus,
    InitialDiagnosis: initialDiagnosis,
    FinalDiagnosis: finalDiagnosis,
    Technical: technical
  } = req.body;

  try {
    // 1️⃣ Get Department ID
    const departmentId = await new Promise((resolve, reject) => {
      db.query("SELECT id FROM Departments WHERE name = ?", [section], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]?.id || null);
      });
    });

    // 2️⃣ Get Device Info
    const deviceInfo = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          md.*, 
          COALESCE(pc.Computer_Name, pr.Printer_Name, sc.Scanner_Name, md.device_name) AS device_name,
          d.name AS department_name
        FROM Maintenance_Devices md
        LEFT JOIN PC_info pc ON md.device_type = 'PC' AND md.serial_number = pc.Serial_Number AND md.governmental_number = pc.Governmental_Number
        LEFT JOIN Printer_info pr ON md.device_type = 'Printer' AND md.serial_number = pr.Serial_Number AND md.governmental_number = pr.Governmental_Number
        LEFT JOIN Scanner_info sc ON md.device_type = 'Scanner' AND md.serial_number = sc.Serial_Number AND md.governmental_number = sc.Governmental_Number
        LEFT JOIN Departments d ON md.department_id = d.id
        WHERE md.id = ?
      `;
      db.query(query, [deviceSpec], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });

    if (!deviceInfo) return res.status(404).json({ error: "❌ Device not found" });

    const deviceType = rawDeviceType || deviceInfo.device_type;

    // 3️⃣ Create Internal Ticket
    const ticketNumber = `TIC-${Date.now()}`;
    const ticketId = await new Promise((resolve, reject) => {
      db.query(
"INSERT INTO Internal_Tickets (ticket_number, priority, department_id, issue_description, assigned_to) VALUES (?, ?, ?, ?, ?)",
[ticketNumber, "Medium", departmentId, problemStatus, technical],

        (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId);
        }
      );
    });

    // 4️⃣ Create Main General Maintenance Report
    const reportNumberMain = `REP-${Date.now()}-MAIN`;
    await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO Maintenance_Reports (report_number, ticket_id, device_id, issue_summary, full_description, status, maintenance_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          reportNumberMain,
          ticketId,
          deviceSpec,
          `Selected Issue: ${problemStatus}`,
          `Initial Diagnosis: ${initialDiagnosis}`,
          "Open",
          "General"
        ],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // 5️⃣ Create Ticket Summary Report
    const reportNumberTicket = `REP-${Date.now()}-TICKET`;
    await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO Maintenance_Reports (report_number, ticket_id, device_id, issue_summary, full_description, status, maintenance_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          reportNumberTicket,
          ticketId,
          deviceSpec,
          "Ticket Created",
          `Ticket (${ticketNumber}) for device: ${deviceInfo.device_name} - Department: ${deviceInfo.department_name}`,
          "Open",
          "General"
        ],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // ✅ Success
    res.json({ message: "✅ General Maintenance and ticket created successfully" });

  } catch (error) {
    console.error("❌ Error in general maintenance:", error);
    res.status(500).json({ error: "❌ Internal server error" });
  }
});

app.get("/device-types", (req, res) => {
  db.query("SELECT DISTINCT device_type FROM Maintenance_Devices WHERE device_type IS NOT NULL ORDER BY device_type ASC", (err, result) => {
    if (err) {
      console.error("❌ Error fetching device types:", err);
      return res.status(500).json({ error: "Database error" });
    }
    // رجّع قائمة بسيطة بدل ما تكون كائنات
    res.json(result.map(row => row.device_type));
  });
});
app.get("/get-external-reports", (req, res) => {
  const externalSql = `
    SELECT 
      id,
      created_at,
      ticket_number,
      device_name,
      department_name,
      initial_diagnosis AS issue_summary,
      final_diagnosis AS full_description,
      status,
      device_type,
      NULL AS priority,
      'external' AS source,
      NULL AS attachment_name,
      NULL AS attachment_path
    FROM External_Maintenance
  `;

  const newSql = `
    SELECT 
      id,
      created_at,
      NULL AS ticket_number,
      NULL AS device_name,
      NULL AS department_name,
      NULL AS issue_summary,
      NULL AS full_description,
      status,
      device_type,
      priority,
      'new' AS source,
      attachment_name,
      attachment_path
    FROM New_Maintenance_Reports
  `;

  const combinedSql = `
    (${externalSql})
    UNION ALL
    (${newSql})
    ORDER BY created_at DESC
  `;

  db.query(combinedSql, (err, result) => {
    if (err) {
      console.error("❌ Error fetching external reports:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});


app.get("/report/:id", (req, res) => {
  const reportId = req.params.id;
  const reportType = req.query.type; // 👈 نقرأ النوع من الرابط

  if (reportType === "external") {
    const sql = `SELECT * FROM External_Maintenance WHERE id = ? LIMIT 1`;

    db.query(sql, [reportId], (err, result) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (!result.length) return res.status(404).json({ error: "External report not found" });

      const r = result[0];
      return res.json({
        id: r.id,
        request_number: r.ticket_number,
        created_at: r.created_at,
        reporter_name: r.reporter_name,
        maintenance_manager: r.maintenance_manager,
        device_name: r.device_name,
        device_type: r.device_type,
        serial_number: r.serial_number,
        governmental_number: r.governmental_number,
        department_name: r.department_name,
        issue_summary: r.initial_diagnosis,
        full_description: r.final_diagnosis,
        cpu_name: r.cpu_name,
        ram_type: r.ram_type,
        os_name: r.os_name,
        generation_number: r.generation_number,
        model_name: r.model_name,
        maintenance_type: "External",
        status: r.status || "Open",
        source: "external"
      });
    });

  } else if (reportType === "new") {
    // ✅ جلب تقرير NEW وقراءة التفاصيل من JSON
    const sql = `SELECT * FROM New_Maintenance_Reports WHERE id = ? LIMIT 1`;
    db.query(sql, [reportId], (err, result) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (!result.length) return res.status(404).json({ error: "New maintenance report not found" });

      const r = result[0];
      let parsedDetails = {};
      try {
        parsedDetails = JSON.parse(r.details || '{}');
      } catch (e) {
        console.warn("⚠️ Failed to parse JSON details");
      }

      return res.json({
        id: r.id,
        created_at: r.created_at,
        report_type: r.report_type,
        device_type: r.device_type,
        priority: r.priority,
        status: r.status,
        maintenance_type: "New",
        details: r.details || "", // 👈 رجعها كـ string عادي
        attachment_name: r.attachment_name,
        attachment_path: r.attachment_path,
        signature_path: r.signature_path || null,

        source: "new"
      });
    });

  } else {
    // ✅ داخلي (Internal)
    const sql = `
      SELECT 
        mr.id AS report_id,
        mr.report_number,
          mr.report_type,         -- ✅ هذا السطر مهم

        mr.status,
        mr.created_at,
        mr.issue_summary,
        mr.full_description,
        mr.maintenance_type,

        md.device_type,
        md.serial_number,
        md.governmental_number,
        COALESCE(pc.Computer_Name, pr.Printer_Name, sc.Scanner_Name, md.device_name) AS device_name,
        d.name AS department_name,
it.ticket_number,

        it.priority,
        it.assigned_to AS technical,

        pc_os.os_name,
        cpu.cpu_name,
        gen.generation_number,
        ram.ram_type,
        model.model_name

      FROM Maintenance_Reports mr
      LEFT JOIN Maintenance_Devices md ON mr.device_id = md.id
      LEFT JOIN Departments d ON md.department_id = d.id
      LEFT JOIN Internal_Tickets it ON mr.ticket_id = it.id
      LEFT JOIN PC_info pc ON md.device_type = 'PC' AND md.serial_number = pc.Serial_Number
      LEFT JOIN CPU_Types cpu ON pc.Processor_id = cpu.id
      LEFT JOIN RAM_Types ram ON pc.RAM_id = ram.id
      LEFT JOIN OS_Types pc_os ON pc.OS_id = pc_os.id
      LEFT JOIN Processor_Generations gen ON pc.Generation_id = gen.id
      LEFT JOIN PC_Model model ON pc.Model_id = model.id
      LEFT JOIN Printer_info pr ON md.device_type = 'Printer' AND md.serial_number = pr.Serial_Number
      LEFT JOIN Scanner_info sc ON md.device_type = 'Scanner' AND md.serial_number = sc.Serial_Number
      WHERE mr.id = ?
    `;

    db.query(sql, [reportId], (err2, result2) => {
      if (err2) return res.status(500).json({ error: "Server error" });
      if (!result2.length) return res.status(404).json({ error: "Internal report not found" });

      return res.json({
        ...result2[0],
        id: result2[0].report_id,
        ticket_number: result2[0].ticket_number, // ✅ أضف هذا

        source: "internal"
      });
    });
  }
});




app.post("/submit-external-maintenance", async (req, res) => {
  const {
    ticket_number,
    device_type: rawDeviceType,
    device_specifications,
    section,
    maintenance_manager,
    reporter_name,
    initial_diagnosis,
    final_diagnosis
  } = req.body;

  try {
    // 🔍 جلب بيانات الجهاز
    const getDeviceInfo = () =>
      new Promise((resolve, reject) => {
        const query = `
          SELECT 
            md.*, 
            COALESCE(pc.Computer_Name, pr.Printer_Name, sc.Scanner_Name, md.device_name) AS device_name,
            COALESCE(c.cpu_name, '') AS cpu_name,
            COALESCE(r.ram_type, '') AS ram_type,
            COALESCE(o.os_name, '') AS os_name,
            COALESCE(g.generation_number, '') AS generation_number,
            COALESCE(pm.model_name, prm.model_name, scm.model_name, '') AS model_name,
            d.name AS department_name
          FROM Maintenance_Devices md
          LEFT JOIN PC_info pc ON md.device_type = 'PC' AND md.serial_number = pc.Serial_Number AND md.governmental_number = pc.Governmental_Number
          LEFT JOIN Printer_info pr ON md.device_type = 'Printer' AND md.serial_number = pr.Serial_Number AND md.governmental_number = pr.Governmental_Number
          LEFT JOIN Scanner_info sc ON md.device_type = 'Scanner' AND md.serial_number = sc.Serial_Number AND md.governmental_number = sc.Governmental_Number
          LEFT JOIN CPU_Types c ON pc.Processor_id = c.id
          LEFT JOIN RAM_Types r ON pc.RAM_id = r.id
          LEFT JOIN OS_Types o ON pc.OS_id = o.id
          LEFT JOIN Processor_Generations g ON pc.Generation_id = g.id
          LEFT JOIN PC_Model pm ON pc.Model_id = pm.id
          LEFT JOIN Printer_Model prm ON pr.Model_id = prm.id
          LEFT JOIN Scanner_Model scm ON sc.Model_id = scm.id
          LEFT JOIN Departments d ON md.department_id = d.id
          WHERE md.id = ?
        `;
        db.query(query, [device_specifications], (err, result) => {
          if (err) return reject(err);
          resolve(result[0]);
        });
      });

    const deviceInfo = await getDeviceInfo();

    if (!deviceInfo) {
      return res.status(404).json({ error: "❌ لم يتم العثور على معلومات الجهاز" });
    }

    // ✅ تجهيز نوع الجهاز
    let deviceType = rawDeviceType?.toLowerCase();
    const allowedTypes = ["pc", "printer", "scanner"];
    deviceType = allowedTypes.includes(deviceType)
      ? deviceType.charAt(0).toUpperCase() + deviceType.slice(1)
      : deviceInfo.device_type;

    // ✅ إنشاء التقرير الأساسي (التشخيص)
    const insertMain = () =>
      new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO External_Maintenance (
            ticket_number, device_type, device_specifications, section,
            maintenance_manager, reporter_name,
            initial_diagnosis, final_diagnosis,
            serial_number, governmental_number, device_name,
            department_name, cpu_name, ram_type, os_name,
            generation_number, model_name
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
          ticket_number,
          deviceType,
          device_specifications,
          section,
          maintenance_manager,
          reporter_name,
          initial_diagnosis,
          final_diagnosis,
          deviceInfo.serial_number,
          deviceInfo.governmental_number,
          deviceInfo.device_name,
          deviceInfo.department_name,
          deviceInfo.cpu_name,
          deviceInfo.ram_type,
          deviceInfo.os_name,
          deviceInfo.generation_number,
          deviceInfo.model_name
        ];
        db.query(sql, values, (err, result) => {
          if (err) return reject(err);
          resolve();
        });
      });

    // ✅ إنشاء تقرير "Ticket Created"
    const insertTicketSummary = () =>
      new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO External_Maintenance (
            ticket_number, device_type, device_specifications, section,
            maintenance_manager, reporter_name,
            initial_diagnosis, final_diagnosis,
            serial_number, governmental_number, device_name,
            department_name, cpu_name, ram_type, os_name,
            generation_number, model_name
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
          ticket_number,
          deviceType,
          device_specifications,
          section,
          maintenance_manager,
          reporter_name,
          "Ticket Created", // 🟦 initial_diagnosis
          `Ticket (${ticket_number}) for device: ${deviceInfo.device_name} - Department: ${deviceInfo.department_name}`, // 🟦 final_diagnosis
          deviceInfo.serial_number,
          deviceInfo.governmental_number,
          deviceInfo.device_name,
          deviceInfo.department_name,
          deviceInfo.cpu_name,
          deviceInfo.ram_type,
          deviceInfo.os_name,
          deviceInfo.generation_number,
          deviceInfo.model_name
        ];
        db.query(sql, values, (err, result) => {
          if (err) return reject(err);
          resolve();
        });
      });

    // ✨ تنفيذ الاثنين معًا
    await insertMain();
    await insertTicketSummary();

    res.json({ message: "✅ External maintenance and ticket summary saved successfully." });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "❌ Internal server error" });
  }
});






app.post("/add-device-specification", async (req, res) => {
  const { ministry, name, model, serial, department, type } = req.body; // 🟢 Extract device data from body

  try {
    // 🟢 Get department ID
    const getDeptId = () =>
      new Promise((resolve, reject) => {
        db.query("SELECT id FROM Departments WHERE name = ?", [department], (err, result) => {
          if (err) return reject(err);
          resolve(result[0]?.id || null);
        });
      });

    const departmentId = await getDeptId();

    // 🔴 Validate required fields
    if (!departmentId || !serial || !ministry || !name || !model) {
      return res.status(400).json({ error: "❌ Missing fields" });
    }

    // 🔍 Check for duplicate serial or governmental number
    const checkQuery = `SELECT * FROM Maintenance_Devices WHERE serial_number = ? OR governmental_number = ?`;
    db.query(checkQuery, [serial, ministry], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (result.length > 0) {
        return res.status(400).json({ error: "⚠️ Device already exists" });
      }

      // ✅ Insert new device if not duplicated
      const insertQuery = `
        INSERT INTO Maintenance_Devices 
        (serial_number, governmental_number, device_type, device_name, department_id)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(insertQuery, [serial, ministry, type, name, departmentId], (err, result) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json({ message: "✅ Specification added successfully", insertedId: result.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "❌ Internal error" });
  }
});



app.post('/AddDevice/:type', async (req, res) => {
  const deviceType = req.params.type.toLowerCase();
  const Serial_Number = req.body.serial;
  const Governmental_Number = req.body["ministry-id"];
  const department = req.body.department;
  const model = req.body.model;
  const Device_Name = req.body["device-name"] || req.body["pc-name"] || null;

  try {
    const getId = async (table, column, value) => {
      return new Promise((resolve, reject) => {
        db.query(`SELECT id FROM ${table} WHERE ${column} = ?`, [value], (err, result) => {
          if (err) reject(err);
          else resolve(result[0]?.id || null);
        });
      });
    };

    const Department_id = await getId('Departments', 'name', department);

    if (!Department_id || !Serial_Number || !Governmental_Number || !Device_Name) {
      return res.status(400).json({ error: "❌ تأكد من تعبئة جميع الحقول المطلوبة" });
    }

    // ✅ إذا الجهاز من الأنواع المعروفة
    if (deviceType === 'pc') {
      const OS_id = await getId('OS_Types', 'os_name', req.body.os);
      const Processor_id = await getId('CPU_Types', 'cpu_name', req.body.processor);
      const Generation_id = await getId('Processor_Generations', 'generation_number', req.body.generation);
      const RAM_id = await getId('RAM_Types', 'ram_type', req.body.ram);
      const Model_id = await getId("PC_Model", "model_name", model);

      if (!OS_id || !Processor_id || !Generation_id || !RAM_id || !Model_id) {
        return res.status(400).json({ error: "❌ تأكد من اختيار كل الخيارات للجهاز (PC)" });
      }

      const insertQuery = `
        INSERT INTO PC_info 
        (Serial_Number, Computer_Name, Governmental_Number, Department, OS_id, Processor_id, Generation_id, RAM_id, Model_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        Serial_Number,
        Device_Name,
        Governmental_Number,
        Department_id,
        OS_id,
        Processor_id,
        Generation_id,
        RAM_id,
        Model_id
      ];

      await new Promise((resolve, reject) => {
        db.query(insertQuery, values, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

    } else if (deviceType === 'printer') {
      const Model_id = await getId("Printer_Model", "model_name", model);
      if (!Model_id) {
        return res.status(400).json({ error: "❌ لم يتم تحديد موديل الطابعة" });
      }

      const insertQuery = `
        INSERT INTO Printer_info 
        (Serial_Number, Printer_Name, Governmental_Number, Department, Model_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [
        Serial_Number,
        Device_Name,
        Governmental_Number,
        Department_id,
        Model_id
      ];

      await new Promise((resolve, reject) => {
        db.query(insertQuery, values, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

    } else if (deviceType === 'scanner') {
      const Model_id = await getId("Scanner_Model", "model_name", model);
      if (!Model_id) {
        return res.status(400).json({ error: "❌ لم يتم تحديد موديل الماسح" });
      }

      const insertQuery = `
        INSERT INTO Scanner_info 
        (Serial_Number, Scanner_Name, Governmental_Number, Department, Model_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [
        Serial_Number,
        Device_Name,
        Governmental_Number,
        Department_id,
        Model_id
      ];

      await new Promise((resolve, reject) => {
        db.query(insertQuery, values, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

    } else {
      console.log(`🔶 نوع جديد سيتم تخزينه فقط في Maintenance_Devices: ${deviceType}`);
    }

    // ✅ إدخال الجهاز في Maintenance_Devices
    const insertMaintenanceDevice = `
      INSERT INTO Maintenance_Devices (serial_number, governmental_number, device_type, device_name, department_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertMaintenanceDevice,
      [Serial_Number, Governmental_Number, deviceType, Device_Name, Department_id],
      (err2, result2) => {
        if (err2) {
          console.error("⚠️ خطأ أثناء إدخال Maintenance_Devices:", err2);
          return res.status(500).json({ error: "❌ خطأ في إضافة Maintenance_Devices" });
        }

        console.log("✅ تم إدخال الجهاز في Maintenance_Devices بنجاح، ID:", result2.insertId);

        res.json({
          message: `✅ تم حفظ بيانات الجهاز (${deviceType}) بنجاح`,
          insertedId: result2.insertId
        });
      }
    );

  } catch (err) {
    console.error("❌ خطأ عام:", err);
    res.status(500).json({ error: "❌ حدث خطأ أثناء المعالجة" });
  }
});



app.get('/get-all-problems', (req, res) => {
  const sql = `
    SELECT problem_text FROM ProblemStates_Pc
    UNION ALL
    SELECT problem_text FROM ProblemStates_Printer
    UNION ALL
    SELECT problem_text FROM ProblemStates_Scanner
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Error while fetching problems:", err);
      return res.status(500).json({ error: 'Server error' });
    }

    console.log("✅ Fetched problems:", result);
    res.json(result);
  });
});


app.get("/models-by-type/:type", (req, res) => {
  const { type } = req.params;
  db.query("SELECT model_name FROM Maintance_Device_Model WHERE device_type_name = ?", [type], (err, result) => {
    if (err) {
      console.error("❌ Error fetching models:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(result);
  });
});

app.post("/add-device-model", (req, res) => {
  const { model_name, device_type_name } = req.body; // 🟢 Extract model name and type from request
  if (!model_name || !device_type_name) {
    return res.status(400).json({ error: "❌ Missing model name or type" }); // 🔴 Validation
  }

  const cleanedType = device_type_name.trim().toLowerCase(); // 🟢 Normalize type input
  let table = "";
  if (cleanedType === "pc") table = "PC_Model";
  else if (cleanedType === "printer") table = "Printer_Model";
  else if (cleanedType === "scanner") table = "Scanner_Model";
  else table = "Maintance_Device_Model"; // 🟢 Use general model table for custom types

  // 🟢 Check if model already exists
  const checkQuery = table === "Maintance_Device_Model"
    ? `SELECT * FROM ${table} WHERE model_name = ? AND device_type_name = ?`
    : `SELECT * FROM ${table} WHERE model_name = ?`;

  const checkValues = table === "Maintance_Device_Model"
    ? [model_name, device_type_name]
    : [model_name];

  db.query(checkQuery, checkValues, (err, existing) => {
    if (err) return res.status(500).json({ error: "Database check failed" });
    if (existing.length > 0) {
      return res.status(400).json({ error: `⚠️ Model \"${model_name}\" already exists` });
    }

    // 🟢 Insert model into appropriate table
    const insertQuery = table === "Maintance_Device_Model"
      ? `INSERT INTO ${table} (model_name, device_type_name) VALUES (?, ?)`
      : `INSERT INTO ${table} (model_name) VALUES (?)`;
    const insertValues = table === "Maintance_Device_Model" ? [model_name, device_type_name] : [model_name];

    db.query(insertQuery, insertValues, (err2) => {
      if (err2) return res.status(500).json({ error: "Database insert failed" });
      res.json({ message: `✅ Model '${model_name}' added successfully` });
    });
  });
});



app.get('/regular-maintenance-summary', (req, res) => {
  const sql = `
    SELECT 
      id,
      device_name,
      device_type,
      last_maintenance_date,
      frequency,
      status, -- ✅ نستخدم الحالة المخزنة، ما نحسبها
      DATE_ADD(last_maintenance_date, INTERVAL 
        CASE 
          WHEN frequency = '3months' THEN 3
          WHEN frequency = '4months' THEN 4
        END MONTH) AS next_due_date
    FROM Regular_Maintenance
    WHERE frequency = '3months'
    ORDER BY next_due_date DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error fetching data' });
    res.json(result);
  });
});




app.put("/update-report-status/:id", async (req, res) => {
  const reportId = req.params.id;
  const { status } = req.body;

  try {
    // Get report with linked ticket_id, device_id and type
    const report = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM Maintenance_Reports WHERE id = ?", [reportId], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });

    if (!report) return res.status(404).json({ error: "Report not found" });

    // Update this specific report
    await new Promise((resolve, reject) => {
      db.query("UPDATE Maintenance_Reports SET status = ? WHERE id = ?", [status, reportId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Update the linked ticket
    await new Promise((resolve, reject) => {
      db.query("UPDATE Internal_Tickets SET status = ? WHERE id = ?", [status, report.ticket_id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // ✅ NEW: Update all other reports under same ticket to match the status
    await new Promise((resolve, reject) => {
      db.query("UPDATE Maintenance_Reports SET status = ? WHERE ticket_id = ?", [status, report.ticket_id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // If regular maintenance, update Regular_Maintenance table
    if (report.maintenance_type === "Regular") {
      await new Promise((resolve, reject) => {
        db.query(  "UPDATE Regular_Maintenance SET status = ? WHERE device_id = ? AND DATE(last_maintenance_date) = DATE(?)",
          [status, report.device_id, report.created_at], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    res.json({ message: "✅ Status updated across report, ticket, and all linked reports" });

  } catch (err) {
    console.error("❌ Failed to update status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});





app.get('/maintenance-stats', (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(CASE
        WHEN CURDATE() > DATE_ADD(last_maintenance_date, INTERVAL 3 MONTH)
        THEN 1
        ELSE 0
      END) AS completed
    FROM Regular_Maintenance
    WHERE frequency = '3months';
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error fetching stats' });
    }
    res.json(result[0]);
  });
});


app.get('/regular-maintenance-summary-4months', (req, res) => {
  const sql = `
    SELECT 
      id,
      device_name,
      device_type,
      last_maintenance_date,
      frequency,
      status,
      DATE_ADD(last_maintenance_date, INTERVAL 4 MONTH) AS next_due_date
    FROM Regular_Maintenance
    WHERE frequency = '4months'
    ORDER BY next_due_date DESC;
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error fetching 4-month data' });
    res.json(result);
  });
});

app.get('/get-internal-reports', (req, res) => {
  const internalSql = `
  SELECT 
    R.id,
    R.created_at,
    R.issue_summary,
    R.full_description,
    R.status,
    R.device_id,
    R.report_number,
    R.ticket_id,
    R.maintenance_type,
    T.ticket_number,
    T.issue_description,
    T.priority,
    COALESCE(RM.department_name, GM.department_name, D.name) AS department_name,
    COALESCE(RM.device_name, GM.device_name, M.device_name) AS device_name,
    RM.frequency,
    M.device_type,
    'internal' AS source,
    T.attachment_name,
    T.attachment_path
  FROM Maintenance_Reports R
  LEFT JOIN Internal_Tickets T 
    ON R.ticket_id = T.id AND R.maintenance_type = 'Internal'
  LEFT JOIN Departments D 
    ON T.department_id = D.id
  LEFT JOIN Maintenance_Devices M 
    ON R.device_id = M.id
  LEFT JOIN Regular_Maintenance RM 
    ON RM.device_id = R.device_id AND R.maintenance_type = 'Regular'
  LEFT JOIN General_Maintenance GM 
    ON GM.device_id = R.device_id AND R.maintenance_type = 'General'
  WHERE R.maintenance_type IN ('Regular', 'General', 'Internal')
`;


  const newSql = `
    SELECT 
      id,
      created_at,
      NULL AS issue_summary,
      NULL AS full_description,
      status,
      NULL AS device_id,
      NULL AS report_number,
      NULL AS ticket_id,
      'New' AS maintenance_type,
      NULL AS ticket_number,
      NULL AS issue_description,
      priority,
      NULL AS department_name,
      NULL AS device_name,
      NULL AS frequency,
      device_type,
      'new' AS source,
      attachment_name,
      attachment_path
    FROM New_Maintenance_Reports
  `;

  const combinedSql = `${internalSql} UNION ALL ${newSql} ORDER BY created_at DESC`;

  db.query(combinedSql, (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch reports:", err);
      return res.status(500).json({ error: "Error fetching reports" });
    }
    res.json(results);
  });
});


app.post("/update-report-full", upload.single("attachment"), (req, res) => {
  const updatedData = JSON.parse(req.body.data || "{}");

  const {
    id, issue_summary, full_description, priority, status, device_type,
    technical, department_name, category, source
  } = updatedData;

  const attachmentFile = req.file;

  if (!source) {
    return res.status(400).json({ error: "Missing source type" });
  }

  if (source === "new") {
    const updateNewSql = `UPDATE New_Maintenance_Reports 
      SET priority = ?, status = ?, device_type = ?${attachmentFile ? ", attachment_name = ?, attachment_path = ?" : ""}
      WHERE id = ?`;

    const values = attachmentFile
      ? [priority, status, device_type, attachmentFile.originalname, attachmentFile.filename, id]
      : [priority, status, device_type, id];

    db.query(updateNewSql, values, (err) => {
      if (err) {
        console.error("❌ Failed to update new report:", err);
        return res.status(500).json({ error: "Failed to update new report" });
      }
      return res.json({ message: "✅ New report updated successfully" });
    });

  } else if (source === "internal") {
    const updateReportSql = `
      UPDATE Maintenance_Reports 
      SET issue_summary = ?, full_description = ?, status = ?, report_type = ?
      ${attachmentFile ? ", attachment_name = ?, attachment_path = ?" : ""}
      WHERE id = ?`;

    const reportValues = attachmentFile
      ? [issue_summary, full_description, status, category, attachmentFile.originalname, attachmentFile.filename, id]
      : [issue_summary, full_description, status, category, id];

    db.query(updateReportSql, reportValues, (err) => {
      if (err) {
        console.error("❌ Failed to update maintenance report:", err);
        return res.status(500).json({ error: "Failed to update maintenance report" });
      }

      const updateTicketSql = `
        UPDATE Internal_Tickets 
        SET priority = ?, assigned_to = ?, status = ? 
        WHERE id = (SELECT ticket_id FROM Maintenance_Reports WHERE id = ?)`;

      const ticketValues = [priority, technical, status, id];

      db.query(updateTicketSql, ticketValues, (err2) => {
        if (err2) {
          console.error("❌ Failed to update internal ticket:", err2);
          return res.status(500).json({ error: "Failed to update internal ticket" });
        }

        return res.json({ message: "✅ Internal ticket and report updated successfully" });
      });
    });

  } else {
    return res.status(400).json({ error: "Unsupported report type" });
  }
});



// ✅ إضافة خيار جديد في جدول OS_Types بعد التحقق
app.post("/add-os", (req, res) => {
  const { value } = req.body; // استخراج القيمة من الطلب
  if (!value) return res.status(400).json({ error: "❌ Missing OS value" }); // التحقق أن القيمة موجودة

  // التحقق من التكرار
  db.query("SELECT * FROM OS_Types WHERE os_name = ?", [value], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length > 0) return res.status(400).json({ error: "⚠️ OS already exists" });

    // إدخال القيمة إذا لم تكن مكررة
    db.query("INSERT INTO OS_Types (os_name) VALUES (?)", [value], (err2) => {
      if (err2) return res.status(500).json({ error: "Insert error" });
      res.json({ message: "✅ OS added successfully" }); // رسالة نجاح
    });
  });
});

// ✅ إضافة خيار جديد في جدول RAM_Types
app.post("/add-ram", (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: "❌ Missing RAM value" });

  db.query("SELECT * FROM RAM_Types WHERE ram_type = ?", [value], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length > 0) return res.status(400).json({ error: "⚠️ RAM already exists" });

    db.query("INSERT INTO RAM_Types (ram_type) VALUES (?)", [value], (err2) => {
      if (err2) return res.status(500).json({ error: "Insert error" });
      res.json({ message: "✅ RAM added successfully" });
    });
  });
});

// ✅ إضافة خيار جديد في جدول CPU_Types
app.post("/add-cpu", (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: "❌ Missing CPU value" });

  db.query("SELECT * FROM CPU_Types WHERE cpu_name = ?", [value], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length > 0) return res.status(400).json({ error: "⚠️ CPU already exists" });

    db.query("INSERT INTO CPU_Types (cpu_name) VALUES (?)", [value], (err2) => {
      if (err2) return res.status(500).json({ error: "Insert error" });
      res.json({ message: "✅ CPU added successfully" });
    });
  });
});

// ✅ إضافة خيار جديد في جدول Processor_Generations
app.post("/add-generation", (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: "❌ Missing generation value" });

  db.query("SELECT * FROM Processor_Generations WHERE generation_number = ?", [value], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length > 0) return res.status(400).json({ error: "⚠️ Generation already exists" });

    db.query("INSERT INTO Processor_Generations (generation_number) VALUES (?)", [value], (err2) => {
      if (err2) return res.status(500).json({ error: "Insert error" });
      res.json({ message: "✅ Generation added successfully" });
    });
  });
});

// ✅ إضافة قسم جديد في جدول Departments
app.post("/add-department", (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: "❌ Missing department value" });

  db.query("SELECT * FROM Departments WHERE name = ?", [value], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length > 0) return res.status(400).json({ error: "⚠️ Department already exists" });

    db.query("INSERT INTO Departments (name) VALUES (?)", [value], (err2) => {
      if (err2) return res.status(500).json({ error: "Insert error" });
      res.json({ message: "✅ Department added successfully" });
    });
  });
});



app.post("/delete-option-general", (req, res) => {
  const { target, value, type } = req.body;

  const tableMap = {
    "problem-type": { table: "DeviceType", column: "DeviceType" },
    "section": { table: "Departments", column: "name" },
    "floor": { table: "Floors", column: "FloorNum" },
    "technical": { table: "Engineers", column: "name" },
    "problem-status": type === "pc"
      ? { table: "ProblemStates_Pc", column: "problem_text" }
      : type === "printer"
        ? { table: "ProblemStates_Printer", column: "problem_text" }
        : type === "scanner"
          ? { table: "ProblemStates_Scanner", column: "problem_text" }
          : { table: "problemStates_Maintance_device", column: "problemStates_Maintance_device_name", extra: "device_type_name" }
  };

  const mapping = tableMap[target];
  if (!mapping) return res.status(400).json({ error: "❌ Invalid target field" });

  let query = "";
  let params = [];

  if (mapping.extra) {
    query = `DELETE FROM ${mapping.table} WHERE ${mapping.column} = ? AND ${mapping.extra} = ?`;
    params = [value, type];
  } else {
    query = `DELETE FROM ${mapping.table} WHERE ${mapping.column} = ?`;
    params = [value];
  }

  db.query(query, params, (err) => {
    if (err) {
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(400).json({
          error: `❌ لا يمكن حذف "${value}" لأنه مرتبط بعناصر أخرى في النظام`
        });
      }

      console.error("❌ Delete failed:", err);
      return res.status(500).json({ error: "❌ Failed to delete option from database" });
    }

    res.json({ message: "✅ Option deleted successfully" });
  });
});

app.put("/update-linked-reports", async (req, res) => {
  const { maintenance_id, status } = req.body;

  try {
    // أولاً نجيب بيانات الجهاز والتاريخ من الجدول الدوري
    const maintenance = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM Regular_Maintenance WHERE id = ?", [maintenance_id], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });

    if (!maintenance) return res.status(404).json({ error: "Maintenance record not found" });

    // تحديث تقارير الصيانة المرتبطة بنفس الجهاز ونفس التاريخ
    db.query(
      `UPDATE Maintenance_Reports 
       SET status = ? 
       WHERE device_id = ? 
       AND maintenance_type = 'Regular'
       AND DATE(created_at) = DATE(?)`,
      [status, maintenance.device_id, maintenance.last_maintenance_date],
      (err) => {
        if (err) {
          console.error("❌ Error updating linked reports:", err);
          return res.status(500).json({ error: "Failed to update linked reports" });
        }

        res.json({ message: "✅ Linked reports updated" });
      }
    );

  } catch (err) {
    console.error("❌ Internal error updating linked reports:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/update-option-general", (req, res) => {
  // 🟡 استقبل البيانات من الطلب
  const { target, oldValue, newValue, type } = req.body;

  // 🟡 خريطة الربط بين العناصر والجدوال والأعمدة
  const tableMap = {
    "problem-type": { table: "DeviceType", column: "DeviceType" },
    "section": { table: "Departments", column: "name" },
    "floor": { table: "Floors", column: "FloorNum" },
    "technical": { table: "Engineers", column: "name" },
    "problem-status": type === "pc"
      ? { table: "ProblemStates_Pc", column: "problem_text" }
      : type === "printer"
        ? { table: "ProblemStates_Printer", column: "problem_text" }
        : type === "scanner"
          ? { table: "ProblemStates_Scanner", column: "problem_text" }
          : { table: "problemStates_Maintance_device", column: "problemStates_Maintance_device_name", extra: "device_type_name" }
  };

  // 🔴 تحقق أن العنصر موجود في الخريطة
  const mapping = tableMap[target];
  if (!mapping) return res.status(400).json({ error: "Invalid target field" });

  // 🟢 تحقق إذا كانت القيمة الجديدة موجودة مسبقًا
  let checkQuery = `SELECT COUNT(*) AS count FROM ${mapping.table} WHERE ${mapping.column} = ?`;
  let checkParams = [newValue];

  // 🟢 إذا الجدول يحتوي على عمود إضافي (مثل نوع الجهاز في problem-status المخصصة)
  if (mapping.extra) {
    checkQuery += ` AND ${mapping.extra} = ?`;
    checkParams.push(type);
  }

  db.query(checkQuery, checkParams, (checkErr, checkResult) => {
    if (checkErr) {
      console.error("❌ Database check failed:", checkErr);
      return res.status(500).json({ error: "Database check failed" });
    }

    // 🛑 إذا القيمة الجديدة موجودة، نمنع التحديث
    if (checkResult[0].count > 0) {
      return res.status(400).json({ error: `❌ "${newValue}" already exists.` });
    }

    // ✅ إنشاء جملة التحديث الرئيسية
    let updateQuery = "";
    let updateParams = [];

    if (mapping.extra) {
      updateQuery = `UPDATE ${mapping.table} SET ${mapping.column} = ? WHERE ${mapping.column} = ? AND ${mapping.extra} = ?`;
      updateParams = [newValue, oldValue, type];
    } else {
      updateQuery = `UPDATE ${mapping.table} SET ${mapping.column} = ? WHERE ${mapping.column} = ?`;
      updateParams = [newValue, oldValue];
    }

    // 🟢 تنفيذ عملية التحديث
    db.query(updateQuery, updateParams, (err, result) => {
      if (err) {
        console.error("❌ Update failed:", err);
        return res.status(500).json({ error: "Failed to update option" });
      }

      // ✅ رد ناجح
      res.json({ message: `✅ "${oldValue}" updated to "${newValue}" successfully.` });
    });
  });
});


// ✅ تعديل خيار عام + تحديث الجداول المرتبطة تلقائيًا
app.post("/edit-option-general", (req, res) => {
  const { target, oldValue, newValue, type } = req.body;

  if (!target || !oldValue || !newValue) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (oldValue.trim() === newValue.trim()) {
    return res.status(400).json({ error: "Same value - no change needed" });
  }

  // 🧠 ماب الجداول والأعمدة حسب نوع السلكت
  const updateMap = {
    "problem-type": {
      table: "DeviceType",
      column: "DeviceType",
      propagate: [
        { table: "Maintenance_Devices", column: "device_type" },
        { table: "General_Maintenance", column: "device_type" },
        { table: "External_Maintenance", column: "device_type" },
        { table: "Regular_Maintenance", column: "device_type" },
        { table: "Maintance_Device_Model", column: "device_type_name" },
        { table: "problemStates_Maintance_device", column: "device_type_name" },
      ]
    },
    "section": {
      table: "Departments",
      column: "name",
      propagate: [
        { table: "Maintenance_Devices", column: "department_name" },
        { table: "General_Maintenance", column: "department_name" },
        { table: "External_Maintenance", column: "department_name" },
        { table: "Regular_Maintenance", column: "department_name" },
      ]
    },
    "floor": {
      table: "Floors",
      column: "FloorNum",
      propagate: [
        { table: "General_Maintenance", column: "floor" }
      ]
    },
    "technical": {
      table: "Engineers",
      column: "name",
      propagate: [
        { table: "General_Maintenance", column: "technician_name" }
      ]
    },
    "problem-status": {
      table: type === "pc"
        ? "ProblemStates_Pc"
        : type === "printer"
          ? "ProblemStates_Printer"
          : type === "scanner"
            ? "ProblemStates_Scanner"
            : "problemStates_Maintance_device",
      column: type === "pc" || type === "printer" || type === "scanner"
        ? "problem_text"
        : "problemStates_Maintance_device_name",
      propagate: [
        { table: "General_Maintenance", column: "problem_status" }
      ]
    }
  };

  const map = updateMap[target];
  if (!map) return res.status(400).json({ error: "Invalid target" });

  const checkDuplicateQuery = `SELECT * FROM ${map.table} WHERE ${map.column} = ?`;
  db.query(checkDuplicateQuery, [newValue], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (rows.length > 0) {
      return res.status(400).json({ error: "This value already exists" });
    }

    const updateQuery = `UPDATE ${map.table} SET ${map.column} = ? WHERE ${map.column} = ?`;
    db.query(updateQuery, [newValue, oldValue], (err) => {
      if (err) return res.status(500).json({ error: "Failed to update main value" });

      // ✅ Update all related tables
      let updateCount = 0;
      map.propagate?.forEach(({ table, column }) => {
        const q = `UPDATE ${table} SET ${column} = ? WHERE ${column} = ?`;
        db.query(q, [newValue, oldValue], (err) => {
          if (err) console.error(`❌ Failed to update ${table}.${column}`, err);
          updateCount++;
        });
      });

      res.json({ message: "✅ Option updated everywhere!" });
    });
  });
});

async function generateTicketNumber(type) {
  return new Promise((resolve, reject) => {
    // نزيد الرقم بمقدار 1
    db.query(
      "UPDATE Ticket_Counters SET last_number = last_number + 1 WHERE type = ?",
      [type],
      (err) => {
        if (err) return reject(err);

        // نسترجع الرقم الجديد
        db.query(
          "SELECT last_number FROM Ticket_Counters WHERE type = ?",
          [type],
          (err, result) => {
            if (err) return reject(err);
            const number = String(result[0].last_number).padStart(6, "0");
            const ticketNumber = `${type}-${number}`;
            resolve(ticketNumber);
          }
        );
      }
    );
  });
}

app.post("/internal-ticket-with-file", upload.single("attachment"), async (req, res) => {
  try {
    const {
      report_number,
      priority,
      department_id,
      issue_description,
      initial_diagnosis,
      final_diagnosis,
      other_description,
      assigned_to,
      status = 'Open'
    } = req.body;

    const file = req.file;
    const fileName = file ? file.filename : null;
    const filePath = file ? file.path : null;

    // ✅ 1. نجيب الرقم الأخير من جدول العدادات
    const counterQuery = `SELECT last_number FROM Ticket_Counters WHERE type = 'INT'`;
    db.query(counterQuery, (counterErr, counterResult) => {
      if (counterErr) {
        console.error("❌ Counter fetch error:", counterErr);
        return res.status(500).json({ error: "Failed to generate ticket number" });
      }

      let newNumber = counterResult[0].last_number + 1;
      let today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      let newTicketNumber = `INT-${today}-${String(newNumber).padStart(3, '0')}`;

      // ✅ 2. نحدث جدول العدادات
      const updateCounterQuery = `UPDATE Ticket_Counters SET last_number = ? WHERE type = 'INT'`;
      db.query(updateCounterQuery, [newNumber], (updateErr) => {
        if (updateErr) {
          console.error("❌ Counter update error:", updateErr);
          return res.status(500).json({ error: "Failed to update ticket counter" });
        }

        // ✅ 3. إدخال التذكرة في جدول Internal_Tickets
        const insertTicketQuery = `
          INSERT INTO Internal_Tickets (
            ticket_number, priority, department_id, issue_description, 
            assigned_to, status, attachment_name, attachment_path
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const ticketValues = [
          newTicketNumber,
          priority || "Medium",
          department_id || null,
          issue_description || '',
          assigned_to || '',
          status,
          fileName,
          filePath
        ];

        db.query(insertTicketQuery, ticketValues, (ticketErr, ticketResult) => {
          if (ticketErr) {
            console.error("❌ Insert error (Internal_Tickets):", ticketErr);
            return res.status(500).json({ error: "Failed to insert internal ticket" });
          }

          const ticketId = ticketResult.insertId;

          // ✅ 4. ربط التقرير بالتذكرة
          const insertReportQuery = `
            INSERT INTO Maintenance_Reports (
              report_number, ticket_id, issue_summary, full_description, 
              status, maintenance_type, report_type
            ) VALUES (?, ?, ?, ?, ?, 'Internal', 'Incident')
          `;

          const reportValues = [
            report_number,
            ticketId,
            initial_diagnosis || '',
            final_diagnosis || other_description || '',
            status
          ];

          db.query(insertReportQuery, reportValues, (reportErr) => {
            if (reportErr) {
              console.error("❌ Insert error (Maintenance_Reports):", reportErr);
              return res.status(500).json({ error: "Failed to insert maintenance report" });
            }

            res.status(201).json({
              message: "✅ Internal ticket and report created",
              ticket_number: newTicketNumber,
              ticket_id: ticketId
            });
          });
        });
      });
    });

  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
});

app.get("/generate-internal-ticket-number", async (req, res) => {
  try {
    const getCounter = `SELECT last_number FROM Ticket_Counters WHERE type = 'INT'`;
    db.query(getCounter, (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to get counter" });

      let newNumber = result[0].last_number + 1;
      let today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      let ticketNumber = `INT-${today}-${String(newNumber).padStart(3, '0')}`;

      return res.json({ ticket_number: ticketNumber });
    });
  } catch (err) {
    console.error("❌ Ticket generation failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.get("/ticket-types", (req, res) => {
  const sql = "SELECT * FROM Ticket_Types ORDER BY type_name ASC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Failed to fetch ticket types:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result);
  });
});


app.post("/submit-new-report", upload.fields([
  { name: "attachment", maxCount: 1 },
  { name: "signature", maxCount: 1 }
]), (req, res) => {
  const {
    report_type,
    device_type,
    priority,
    details // ✅ الآن نستقبل الوصف كـ details
  } = req.body;

  const attachment = req.files?.attachment?.[0] || null;
const signature = req.files?.signature?.[0] || null;

const attachmentName = attachment?.originalname || null;
const attachmentPath = attachment ? `uploads/${attachment.filename}` : null;
const signaturePath = signature ? `uploads/${signature.filename}` : null;

  const sql = `
    INSERT INTO New_Maintenance_Reports 
    (report_type, device_type, priority, attachment_name, attachment_path, signature_path, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    report_type,
    device_type,
    priority || "Medium",
    attachmentName,
    attachmentPath,
    signaturePath,
    details?.trim() || null // ✅ تأكد إنها سترينق نظيف، أو null
  ], (err, result) => {
    if (err) {
      console.error("❌ Error inserting new report:", err);
      return res.status(500).json({ error: "Database insert error" });
    }

    res.json({ message: "✅ New report saved successfully", id: result.insertId });
  });
});




app.get("/ticket-status", (req, res) => {
  db.query("SELECT DISTINCT status FROM Maintenance_Reports", (err, result) => {
    if (err) {
      console.error("❌ Failed to fetch statuses:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result.map(r => ({ status_name: r.status })));
  });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

