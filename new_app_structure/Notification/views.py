from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from email.utils import formataddr
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Define sender email and credentials from environment variables
SENDER_EMAIL = os.getenv('SENDER_EMAIL')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD')
SENDER_TITLE = os.getenv('SENDER_TITLE', "Test - Software Team")
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.zoho.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 465))

print(SENDER_EMAIL)


@csrf_exempt
def notification_send_email(request):
    if request.method == 'POST':
        try:
            # Parse JSON body
            data = json.loads(request.body)
            recipient = data.get('recipient')

            if not recipient:
                return JsonResponse({"error": "Recipient email is required."}, status=400)

            # Create email message
            msg = MIMEMultipart()
            msg['From'] = formataddr((str(Header(SENDER_TITLE, 'utf-8')), SENDER_EMAIL))
            msg['To'] = recipient
            msg['Subject'] = "Product Received In Inventory"

            # Email body
            body = """
            Hello User,

            Your requested product [product_name] is now available in the Inventory. Please check with the Inventory Manager.

            Thanks,
            Software Team - PIMS
            """
            msg.attach(MIMEText(body, 'plain', 'utf-8'))

            # Send email
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient, msg.as_string())
            server.quit()

            return JsonResponse({"message": "Email sent successfully!"}, status=200)

        except Exception as e:
            return JsonResponse({"error": f"Failed to send email: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)




@csrf_exempt
def approval_notification_send_email(request):
    if request.method == 'POST':
        try:
            # Parse JSON body
            data = json.loads(request.body)
            recipient = data.get('recipient')

            if not recipient:
                return JsonResponse({"error": "Recipient email is required."}, status=400)

            # Create email message
            msg = MIMEMultipart()
            msg['From'] = formataddr((str(Header(SENDER_TITLE, 'utf-8')), SENDER_EMAIL))
            msg['To'] = recipient
            msg['Subject'] = "Request Approval Notification"

            # Email body
            body = """
            Hello User,

            New Request is the waiting for the approval.

            Thanks,
            Software Team - PIMS
            """
            msg.attach(MIMEText(body, 'plain', 'utf-8'))

            # Send email
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient, msg.as_string())
            server.quit()

            return JsonResponse({"message": "Email sent successfully!"}, status=200)

        except Exception as e:
            return JsonResponse({"error": f"Failed to send email: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)





@csrf_exempt
def new_submit_notification_send_email(request):
    if request.method == 'POST':
        try:
            # Parse JSON body
            data = {
                "recipient": "suriyaprakash.a@aero360.co.in"
            }
            recipient = data.get('recipient')
            
            
            recipient="suriyaprakash.a@aero360.co.in"

            if not recipient:
                return JsonResponse({"error": "Recipient email is required."}, status=400)

            # Create email message
            msg = MIMEMultipart()
            msg['From'] = formataddr((str(Header(SENDER_TITLE, 'utf-8')), SENDER_EMAIL))
            msg['To'] = recipient
            msg['Subject'] = "Request submitted Notification"

            # Email body
            body = """
            Hello User,

            New Request is the submitted for the approval.

            Thanks,
            Software Team - PIMS
            """
            msg.attach(MIMEText(body, 'plain', 'utf-8'))

            # Send email
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient, msg.as_string())
            server.quit()

            return JsonResponse({"message": "Email sent successfully!"}, status=200)

        except Exception as e:
            return JsonResponse({"error": f"Failed to send email: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)





@csrf_exempt
def inward_notification_send_email(request):
    if request.method == 'POST':
        try:
            # Parse JSON body
            data = {
                "recipient": "suriyaprakash.a@aero360.co.in"
            }
            recipient = data.get('recipient')



            if not recipient:
                return JsonResponse({"error": "Recipient email is required."}, status=400)

            # Create email message
            msg = MIMEMultipart()
            msg['From'] = formataddr((str(Header(SENDER_TITLE, 'utf-8')), SENDER_EMAIL))
            msg['To'] = recipient
            msg['Subject'] = "Inward Notification"

            # Email body
            body = """
            Hello User,

            request product is available in the inventory check the inventory manager.
            
            Thanks,
            Software Team - PIMS
            """
            msg.attach(MIMEText(body, 'plain', 'utf-8'))

            # Send email
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient, msg.as_string())
            server.quit()

            return JsonResponse({"message": "Email sent successfully!"}, status=200)

        except Exception as e:
            return JsonResponse({"error": f"Failed to send email: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method."}, status=405)
