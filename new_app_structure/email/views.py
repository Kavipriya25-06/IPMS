# import logging
# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# from email.mime.base import MIMEBase
# from email import encoders
# from email.header import Header
# from email.utils import formataddr
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status

# # Configure logging
# logging.basicConfig(
#     filename="email_api.log",
#     level=logging.INFO,
#     format="%(asctime)s - %(levelname)s - %(message)s",
# )

# class SendEmailView(APIView):
#     def post(self, request):
#         data = request.data
#         sender = data.get("sender", "")
#         #sender_title = data.get("sender_title", "Django Emailer")
#         recipient = data.get("recipient", "")
#         #cc_recipient = data.get("cc", "")
#         #bcc_recipient = data.get("bcc", "")
#         subject = data.get("subject", "No Subject")
#         body = data.get("body", "No Content")
#         filename = data.get("filename", None)  # Path to the attachment file

#         if not sender or not recipient:
#             return Response(
#                 {"error": "Sender and recipient are required fields."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         # Create a MIMEMultipart message
#         msg = MIMEMultipart()
#         msg['Subject'] = Header(subject, 'utf-8')
#         msg['From'] = formataddr((str(Header( 'utf-8')), sender))
#         msg['To'] = recipient
        

#         # Add email body
#         msg.attach(MIMEText(body, 'plain', 'utf-8'))

#         # Attach file if provided
#         if filename:
#             try:
#                 with open(filename, "rb") as attachment:
#                     part = MIMEBase("application", "octet-stream")
#                     part.set_payload(attachment.read())
#                 encoders.encode_base64(part)
#                 part.add_header(
#                     "Content-Disposition",
#                     f"attachment; filename={filename}",
#                 )
#                 msg.attach(part)
#                 logging.info(f"Attachment '{filename}' added successfully.")
#             except FileNotFoundError:
#                 logging.error(f"Error: File '{filename}' not found. Skipping attachment.")
#                 return Response(
#                     {"error": f"File '{filename}' not found."},
#                     status=status.HTTP_400_BAD_REQUEST,
#                 )



#         # Send the email
#         try:
#             server = smtplib.SMTP_SSL('smtp.zoho.com', 465)
#             server.login('ganesan@aero360.co.in', 'Ganesh@@123')
#             logging.info("Logged in to the SMTP server successfully.")
#             server.sendmail(sender,  msg.as_string())
#             server.quit()
#             logging.info("SMTP server connection closed.")
#             return Response({"message": "Email sent successfully!"}, status=status.HTTP_200_OK)
#         except Exception as e:
#             logging.error(f"Error sending email: {e}")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#---------------------------------------------------------------------------------------------------------------------------------------

# import logging
# import os
# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# from email.mime.base import MIMEBase
# from email import encoders
# from email.header import Header
# from email.utils import formataddr
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status

# # Configure logging
# logging.basicConfig(
#     filename="email_api.log",
#     level=logging.INFO,
#     format="%(asctime)s - %(levelname)s - %(message)s",
# )

# class SendEmailView(APIView):
#     def post(self, request):
#         data = request.data

#         sender = data.get("sender", "")
#         recipient = data.get("recipient", "")
#         subject = data.get("subject", "No Subject")
#         body = data.get("body", "No Content")
#         filename = data.get("filename", None)

#         # Validate sender and recipient
#         if not sender or not recipient:
#             logging.error("Sender or recipient is missing.")
#             return Response(
#                 {"error": "Sender and recipient are required fields."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         # Create a MIMEMultipart email message
#         msg = MIMEMultipart()
#         msg['Subject'] = Header(subject, 'utf-8')
#         msg['From'] = formataddr((str(Header("Django Emailer", 'utf-8')), sender))
#         msg['To'] = recipient

#         # Add the email body
#         msg.attach(MIMEText(body, 'plain', 'utf-8'))

#         # Handle file attachment
#         if filename:
#             try:
#                 if not os.path.isfile(filename):
#                     logging.error(f"File '{filename}' does not exist.")
#                     return Response(
#                         {"error": f"File '{filename}' not found."},
#                         status=status.HTTP_400_BAD_REQUEST,
#                     )
#                 with open(filename, "rb") as attachment:
#                     part = MIMEBase("application", "octet-stream")
#                     part.set_payload(attachment.read())
#                 encoders.encode_base64(part)
#                 part.add_header(
#                     "Content-Disposition",
#                     f"attachment; filename={os.path.basename(filename)}",
#                 )
#                 msg.attach(part)
#                 logging.info(f"Attachment '{filename}' added successfully.")
#             except FileNotFoundError:
#                 logging.error(f"File '{filename}' not found.")
#                 return Response(
#                     {"error": f"File '{filename}' not found."},
#                     status=status.HTTP_400_BAD_REQUEST,
#                 )
#             except Exception as e:
#                 logging.error(f"Unexpected error while adding attachment: {e}")
#                 return Response(
#                     {"error": f"Unexpected error: {e}"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 )
#         else:
#             logging.info("No attachment provided.")

#         # Send the email
#         try:
#             server = smtplib.SMTP_SSL('smtp.zoho.com', 465)
#             smtp_email = "ganesan@aero360.co.in"
#             smtp_password = "Ganesh@@123aero"

#             if not smtp_email or not smtp_password:
#                 logging.error("SMTP credentials are not set.")
#                 return Response(
#                     {"error": "SMTP credentials are missing in the environment."},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 )

#             server.login(smtp_email, smtp_password)
#             logging.info("Logged in to the SMTP server successfully.")
#             server.sendmail(sender, recipient, msg.as_string())
#             server.quit()
#             logging.info(f"Email sent successfully to {recipient} with subject '{subject}'.")
#             return Response({"message": "Email sent successfully!"}, status=status.HTTP_200_OK)
#         except smtplib.SMTPException as e:
#             logging.error(f"SMTP error: {e}")
#             return Response({"error": f"SMTP error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#         except Exception as e:
#             logging.error(f"Error sending email: {e}")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#==========================================================================================================================


#upload scrip

import os
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser      
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.header import Header
from email.utils import formataddr
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
from django.core.mail import EmailMessage
SMTP_SERVER = 'smtp.zoho.com'
SMTP_PORT = 465
smtp_email = 'sme@aero360.co.in'
smtp_password = 'Aero360@2024'

# class SendEmailView(APIView):
#     parser_classes = [MultiPartParser, FormParser]  # Allow multipart form data

#     def post(self, request):
        
#         data = request.data

#         sender = data.get("sender", "")
#         recipient = data.get("recipient", "")
#         subject = data.get("subject", "No Subject")
#         body = data.get("body", "No Content")
#         uploaded_file = request.FILES.get("filename", None)
        


#         # Validate sender and recipient
#         try:
#             validate_email(sender)
#             validate_email(recipient)
#         except ValidationError as e:
#             logging.error(f"Invalid email address: {e}")
#             return Response({"error": "Invalid sender or recipient email address."}, status=status.HTTP_400_BAD_REQUEST)

#         if not smtp_email or not smtp_password:
#             logging.error("SMTP credentials are missing.")
#             return Response({"error": "SMTP credentials are not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         file_path = None
#         if uploaded_file:
#             if uploaded_file.size > 50 * 1024 * 1024:  # 10 MB limit
#                 logging.error("Uploaded file exceeds size limit.")
#                 return Response({"error": "File size exceeds the maximum limit of 10 MB."}, status=status.HTTP_400_BAD_REQUEST)
#             try:
#                 file_path = os.path.join(settings.MEDIA_ROOT, "email_attachments", uploaded_file.name)
#                 os.makedirs(os.path.dirname(file_path), exist_ok=True)
#                 with open(file_path, "wb") as f:
#                     for chunk in uploaded_file.chunks():
#                         f.write(chunk)
#                 logging.info(f"Uploaded file saved at {file_path}.")
#             except Exception as e:
#                 logging.error(f"Error saving uploaded file: {e}")
#                 return Response({"error": "Failed to save uploaded file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         # Create email
#         msg = MIMEMultipart()
#         msg['Subject'] = Header(subject, 'utf-8')
#         msg['From'] = formataddr((str(Header("Order Details for PO ID: ", 'utf-8')), sender))
#         msg['To'] = recipient
#         msg.attach(MIMEText(body, 'plain', 'utf-8'))

#         if file_path:
#             try:
#                 with open(file_path, "rb") as attachment:
#                     part = MIMEBase("application", "octet-stream")
#                     part.set_payload(attachment.read())
#                 encoders.encode_base64(part)
#                 part.add_header(
#                     "Content-Disposition",
#                     f"attachment; filename={os.path.basename(file_path)}",
#                 )
#                 msg.attach(part)
#                 logging.info(f"Attachment '{file_path}' added successfully.")
#             except Exception as e:
#                 logging.error(f"Error attaching file: {e}")
#                 return Response({"error": "Failed to attach the uploaded file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         try:
#             server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
#             server.login(smtp_email, smtp_password)
#             logging.info("Logged in to the SMTP server successfully.")
#             server.sendmail(sender, recipient, msg.as_string())
#             server.quit()
#             logging.info(f"Email sent successfully to {recipient} with subject '{subject}'.")
#             return Response({"message": f"Email sent to {recipient} successfully!", "subject": subject}, status=status.HTTP_200_OK)
#         except smtplib.SMTPException as e:
#             logging.error(f"SMTP error: {e}")
#             return Response({"error": f"SMTP error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#         except Exception as e:
#             logging.error(f"Error sending email: {e}")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SendEmailView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        data = request.data

        # SMTP credentials
        sender = smtp_email

        # Parse recipient, CC, and BCC fields
        try:
            recipients = json.loads(request.data.get("recipient", "[]"))
            cc = json.loads(request.data.get("cc", "[]"))
            bcc = json.loads(request.data.get("bcc", "[]"))
        except json.JSONDecodeError as e:
            logging.error(f"Error parsing email fields: {e}")
            return Response({"error": "Invalid email field format."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure they are lists and filter out empty strings
        if not isinstance(recipients, list):
            recipients = [recipients]
        if not isinstance(cc, list):
            cc = [cc]
        if not isinstance(bcc, list):
            bcc = [bcc]

        recipients = [email.strip() for email in recipients if email.strip()]
        cc = [email.strip() for email in cc if email.strip()]
        bcc = [email.strip() for email in bcc if email.strip()]

        # Validate email addresses
        all_emails = recipients + cc + bcc
        try:
            for email in all_emails:
                validate_email(email)
        except ValidationError as e:
            logging.error(f"Invalid email address: {e}")
            return Response({"error": "Invalid email address provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Check SMTP credentials
        if not smtp_email or not smtp_password:
            logging.error("SMTP credentials are missing.")
            return Response({"error": "SMTP credentials are not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Handle file upload
        file_path = None
        uploaded_file = request.FILES.get("filename", None)
        if uploaded_file:
            if uploaded_file.size > 50 * 1024 * 1024:  # 50 MB limit
                logging.error("Uploaded file exceeds size limit.")
                return Response({"error": "File size exceeds the maximum limit of 50 MB."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                file_path = os.path.join(settings.MEDIA_ROOT, "email_attachments", uploaded_file.name)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                with open(file_path, "wb") as f:
                    for chunk in uploaded_file.chunks():
                        f.write(chunk)
                logging.info(f"Uploaded file saved at {file_path}.")
            except Exception as e:
                logging.error(f"Error saving uploaded file: {e}")
                return Response({"error": "Failed to save uploaded file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Create email
        msg = MIMEMultipart()
        msg['Subject'] = Header(data.get("subject", "No Subject"), 'utf-8')
        msg['From'] = formataddr((str(Header("Order Details for PO ID: ", 'utf-8')), sender))
        msg['To'] = ', '.join(recipients)
        if cc:
            msg['Cc'] = ', '.join(cc)
        msg.attach(MIMEText(data.get("body", "No Content"), 'plain', 'utf-8'))

        if file_path:
            try:
                with open(file_path, "rb") as attachment:
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename={os.path.basename(file_path)}",
                )
                msg.attach(part)
                logging.info(f"Attachment '{file_path}' added successfully.")
            except Exception as e:
                logging.error(f"Error attaching file: {e}")
                return Response({"error": "Failed to attach the uploaded file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Send email
        try:
            server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
            server.login(smtp_email, smtp_password)
            logging.info("Logged in to the SMTP server successfully.")
            server.sendmail(sender, recipients + cc + bcc, msg.as_string())
            server.quit()
            logging.info(f"Email sent successfully to recipients: {recipients} with CC: {cc} and BCC: {bcc}.")
            return Response({"message": "Email sent successfully!"}, status=status.HTTP_200_OK)
        except smtplib.SMTPException as e:
            logging.error(f"SMTP error: {e}")
            return Response({"error": f"SMTP error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logging.error(f"Error sending email: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




import os
import logging
from django.conf import settings
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status


def upload_file(uploaded_file, folder_name="email_attachments"):
    """
    Handles file uploads and saves the file to the specified directory.

    Args:
        uploaded_file: File object from the request.
        folder_name: Folder to save the uploaded file (relative to MEDIA_ROOT).

    Returns:
        str: The file path where the file is saved.

    Raises:
        ValueError: If the file size exceeds the allowed limit or if there's an error during file saving.
    """
    if not uploaded_file:
        raise ValueError("No file provided for upload.")

    if uploaded_file.size > 50 * 1024 * 1024:  # 50 MB limit
        raise ValueError("File size exceeds the maximum limit of 50 MB.")

    file_path = os.path.join(settings.MEDIA_ROOT, folder_name, uploaded_file.name)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    try:
        with open(file_path, "wb") as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)
        logging.info(f"Uploaded file saved at {file_path}.")
    except Exception as e:
        logging.error(f"Error saving uploaded file: {e}")
        raise ValueError("Failed to save uploaded file.")

    return file_path


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def file_upload_view(request):
    """
    Handles file uploads through a POST request.

    Args:
        request: Django REST framework request object.

    Returns:
        Response: JSON response with success or error message.
    """
    uploaded_file = request.FILES.get("file", None)
    if not uploaded_file:
        return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        file_path = upload_file(uploaded_file)
        return Response({"message": "File uploaded successfully.", "file_path": file_path}, status=status.HTTP_200_OK)
    except ValueError as e:
        logging.error(str(e))
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
