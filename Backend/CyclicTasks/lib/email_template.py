email_template = """
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-size: cover;
      font-family: Arial, sans-serif;
      color: #ffffff;
    }}
    .email-container {{
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      background-image: url('https://res.cloudinary.com/dkn1btaci/image/upload/v1728906890/veblkdbbeea0jbeu3ccl.jpg');
      background-size:contain;
    }}
    .email-header {{
      text-align: center;
      background-color: #12121299;
      color: #ffffff;
      padding: 20px;
    }}
    .email-header h1 {{
      margin: 0;
      font-size: 24px;
    }}
    .email-content {{
      padding: 20px;
      color: white;
      line-height: 1.6;
      font-size: 16px;
    }}
    .email-footer {{
      text-align: center;
      font-size: 12px;
      color: #888888;
      padding: 20px;
    }}
    .red {{
      font-weight: bold;
      color: #ff4c4c;
    }}
    .green {{
      font-weight: bold;
      color: #4cff4c;      
    }}
    p {{
      margin: 0;
    }}
    pre {{
      margin: 0;  
      font-size: 11px;
    }}
  </style>
</head>
<body>
  <table class="email-container" cellpadding="0" cellspacing="0">
    <tr>
      <td class="email-header">
        <h1>CyclicTasks</h1>
      </td>
    </tr>
    <tr>
      <td class="email-content">
        <p>Hi {USER_NAME},</p><br>
        {EMAIL_CONTENT}
        <br>
        <p>Best regards,</p>
        <p><strong>CyclicTasks Team</strong></p>
      </td>
    </tr>
    <tr>
      <td class="email-footer">
        &copy; 2024 CyclicTasks | <a href="mailto:darkglance.developer@gmail.com">Contact Support</a>
      </td>
    </tr>
  </table>
</body>
</html>
"""

__all__ = ['email_template']