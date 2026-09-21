import { SchoolInfo } from '../types';

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function validateIndianPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-+]/g, '');
  // Match 10 digits starting with 6, 7, 8, 9, or with 91 prefix
  if (clean.length === 12 && clean.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(clean.substring(2));
  }
  return /^[6-9]\d{9}$/.test(clean);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeText(text: string): string {
  return text.replace(/[<>]/g, '').trim();
}

/**
 * Generates an authentic printable or downloadable school document with official header
 */
export function triggerSchoolDownload(
  title: string,
  fileName: string,
  category: string,
  schoolInfo: SchoolInfo
): void {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - ${schoolInfo.name}</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 40px;
      color: #1e293b;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      border-bottom: 3px double #0f2b5c;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .school-name {
      font-size: 26px;
      font-weight: bold;
      color: #0f2b5c;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .school-sub {
      font-size: 14px;
      color: #475569;
      margin: 6px 0 2px 0;
    }
    .school-contact {
      font-size: 13px;
      font-weight: 600;
      color: #0369a1;
    }
    .doc-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      font-size: 13px;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }
    .doc-title {
      font-size: 20px;
      color: #0f172a;
      border-left: 4px solid #0f2b5c;
      padding-left: 12px;
      margin: 20px 0;
    }
    .section-title {
      font-size: 15px;
      font-weight: bold;
      color: #1e3a8a;
      margin-top: 20px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 10px 12px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #0f2b5c;
    }
    .signature-area {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
      padding-top: 40px;
    }
    .sig-box {
      text-align: center;
      width: 200px;
      border-top: 1px solid #94a3b8;
      padding-top: 6px;
      font-size: 13px;
      font-weight: bold;
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      background: #fef3c7;
      color: #92400e;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
    }
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="school-name">${schoolInfo.name}</div>
    <div class="school-sub">${schoolInfo.affiliationNotice}</div>
    <div class="school-sub">${schoolInfo.address}</div>
    <div class="school-contact">Phone: ${schoolInfo.phone} | Email: ${schoolInfo.email}</div>
  </div>

  <div class="doc-meta">
    <div><strong>Category:</strong> <span class="badge">${category.toUpperCase()}</span></div>
    <div><strong>Ref No:</strong> VVES/KTL/${new Date().getFullYear()}/DOC-${Math.floor(1000 + Math.random() * 9000)}</div>
    <div><strong>Date of Issue:</strong> ${dateStr}</div>
  </div>

  <h2 class="doc-title">${title}</h2>

  <div class="content">
    <p>This official document is issued by the administrative office of <strong>${schoolInfo.name}</strong>, Kotauratla, Anakapalle District for the academic session 2026–2027.</p>
    
    <div class="section-title">Institutional Guidelines & Verification</div>
    <p>Vidya Vikas EM School is committed to delivering disciplined, value-centered English medium schooling from foundational Pre-Primary to Class X (SSC). Parents and guardians are requested to preserve this official document for academic records and administrative correspondence.</p>

    <table>
      <thead>
        <tr>
          <th>Particulars</th>
          <th>Institutional Specification</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>School Name</td>
          <td>${schoolInfo.name}</td>
        </tr>
        <tr>
          <td>Campus Location</td>
          <td>${schoolInfo.location}, ${schoolInfo.mandal}, ${schoolInfo.district}, Andhra Pradesh</td>
        </tr>
        <tr>
          <td>Medium of Instruction</td>
          <td>English Medium (with Telugu & Hindi language curriculum)</td>
        </tr>
        <tr>
          <td>Class Levels</td>
          <td>Nursery, LKG, UKG, Class I to Class X</td>
        </tr>
        <tr>
          <td>Administrative Inquiries</td>
          <td>Phone: +91-${schoolInfo.phone} (8:30 AM to 5:00 PM)</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">Important Instructions for Parents & Students</div>
    <ul>
      <li>Please submit completed admission applications along with the candidate's date of birth certificate, previous school transfer certificate (T.C.), and Aadhaar card copies.</li>
      <li>Fee regulations, uniform standards, and attendance requirements must be adhered to as per the official school handbook.</li>
      <li>For any verification or queries, please contact the administrative counter at Kotauratla campus during official working hours.</li>
    </ul>
  </div>

  <div class="signature-area">
    <div class="sig-box">
      Administrative In-charge<br>
      ${schoolInfo.name}
    </div>
    <div class="sig-box">
      ${schoolInfo.principalName}<br>
      Principal
    </div>
  </div>
</body>
</html>
`;

  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  // If download filename ends with .pdf, download as printable html or open in new tab
  const actualName = fileName.replace(/\.pdf$/i, '.html');
  a.download = actualName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
