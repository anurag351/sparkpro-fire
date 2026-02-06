from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.colors import blue, black, HexColor
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from PIL import Image
import io

# In your generate_salary_slip_pdf function, set the font before drawing the rupee symbol
  # Use the registered font

# -------------------------------------------------------
# FINAL CORRECT IMAGE PATHS
# -------------------------------------------------------

LOGO_PATH = "static/company_logo.png"
SIGNATURE_PATH = "static/sign.png"

def add_watermark(pdf, width, height):
    pdf.saveState()

    # Set transparency (ReportLab supports alpha on fillColorRGB)
    pdf.setFillColorRGB(0.85, 0.85, 0.85, alpha=0.20)

    pdf.setFont("Helvetica-Bold", 65)

    # Move to center of the page
    pdf.translate(width / 2, height / 2)

    # Rotate text diagonally
    pdf.rotate(45)

    # Draw watermark
    pdf.drawCentredString(0, 0, "SparkPro Pvt. Ltd.")

    pdf.restoreState()


def load_image_as_jpeg(path):
    pil_img = Image.open(path).convert("RGB")    # Remove alpha
    buffer = io.BytesIO()
    pil_img.save(buffer, format="JPEG")
    buffer.seek(0)
    return ImageReader(buffer)


# -------------------------------------------------------
# PDF FUNCTION
# -------------------------------------------------------

def generate_salary_slip_pdf(company_name: str, month_title: str, employee: dict, salary: dict):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    add_watermark(pdf, width, height)
    # ======================================================
    # HEADER SECTION (Logo + Company Name + Salary Slip Title)
    # ======================================================

    # Logo (left)
    try:
        logo = load_image_as_jpeg(LOGO_PATH)
        pdf.drawImage(logo, 3.5*cm, 9.2*cm, width=4.5*cm, preserveAspectRatio=True)
    except Exception as e:
        pdf.drawString(2*cm, height - 3*cm, "(Logo Missing)")

    # Company Name (center-left)
    pdf.setFont("Helvetica-Bold", 28)

    # Blue foreground for 3D look
    text_x = 6.5 * cm
    text_y = height - 2.7 * cm

    pdf.setFillColor(black)
    pdf.drawString(text_x + 1.2, text_y - 1.2, company_name)  # Shadow

    pdf.setFillColor(blue)
    pdf.drawString(text_x, text_y, company_name)

    # Salary Slip Title (Right side)
    pdf.setFillColor(black)
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawRightString(width - 2*cm, height - 4*cm, f"Salary Slip - {month_title}")

    # ======================================================
    # MAIN OUTER BORDER
    # ======================================================
    main_top = height - 4.3 * cm
    pdf.rect(1.5 * cm, 1.5 * cm, width - 3 * cm, main_top - 1.5 * cm)

    # ======================================================
    # EMPLOYEE DETAILS BOX
    # ======================================================
    emp_box_top = main_top - 1 * cm
    emp_box_height = 4.5 * cm

    pdf.setLineWidth(1)
    pdf.rect(2 * cm, emp_box_top - emp_box_height, width - 4 * cm, emp_box_height)

    # Title
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(2.4 * cm, emp_box_top - 0.7 * cm, "Employee Details")
    pdf.line(2*cm, height - 6.4*cm, width - 2*cm, height - 6.4*cm)

    pdf.setFont("Helvetica", 11)
    left_x = 2.7 * cm
    right_x = width / 2 + 1 * cm
    y = emp_box_top - 1.8 * cm
    line_gap = 0.9 * cm

    left_fields = [
        ("Employee ID", employee["id"]),
        ("Name", employee["name"]),
        ("Role", employee["role"]),
    ]

    right_fields = [
        ("Department", employee.get("department", "N/A")),
        ("Date of Joining", employee["date_of_joining"]),
    ]

    for label, val in left_fields:
        pdf.drawString(left_x, y, f"{label}: {val}")
        y -= line_gap

    y = emp_box_top - 1.8 * cm
    for label, val in right_fields:
        pdf.drawString(right_x, y, f"{label}: {val}")
        y -= line_gap

    # ======================================================
    # SALARY DETAILS TABLE
    # ======================================================
    sal_box_top = emp_box_top - emp_box_height - 2 * cm
    sal_box_height = 7.1 * cm
    sal_box_width = width - 4 * cm

    pdf.rect(2 * cm, sal_box_top - sal_box_height, sal_box_width, sal_box_height)

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(2.4 * cm, sal_box_top - 0.85 * cm, "Salary Details")
    pdf.line(2*cm, sal_box_top -1.3*cm, width - 2*cm, sal_box_top -1.3*cm)

    rupee_icon = None
    icon_width = 0.5 * cm  # Adjust size as needed
    icon_height = 0.5 * cm
    try:
        rupee_icon = load_image_as_jpeg("static/rupeeIcon.jpg")
    except Exception as e:
        rupee_icon = None

    # Table data (row borders only)
    overtime_salary = salary["overtime_hours"] * salary["overtime_rate"]
    table_data = [
    ["Basic Salary", f"{salary['basic_salary']}"], 
    ["Allowances", f"{salary['allowances']}"],
    ["Overtime Salary", f" {overtime_salary}"],
    ["Deductions", f"{salary['deductions']}"],
    ["Advance Salary", f"{salary['advance_salary']}"],
    ["Total Payable", f"{salary['net_salary']- salary['advance_salary']}"],
    ["Net Salary", f"{salary['net_salary']}"],
    ]

   
    pdf.setFont("Helvetica", 12)
    start_y = sal_box_top - 2 * cm
    line_height = 0.8 * cm
    left_x = 2.5 * cm
    right_x = width - 4 * cm

    table_width = width - 4*cm

    table = Table(
        table_data,
        colWidths=[table_width * 0.55, table_width * 0.45],
    )
    
    for label, value in table_data:
        pdf.drawString(left_x, start_y, label)
        if rupee_icon is not None:
            try:
                pdf.drawImage(rupee_icon, right_x - 2 * cm, start_y - 0.1 * cm, width=icon_width, height=icon_height)
            except Exception as e:
                pass
        pdf.drawRightString(right_x, start_y, f"{value}")
        pdf.line(left_x-0.5*cm, start_y - 0.3* cm, right_x+2*cm, start_y - 0.3 * cm)  # Row separator
        start_y -= line_height

    # table.setStyle(TableStyle([
    #     ("FONT", (0, 0), (-1, -1), "Helvetica", 12),
    #     ("ALIGN", (1, 0), (1, -1), "RIGHT"),

    #     # Row Border Only
    #     ("LINEABOVE", (0, 0), (-1, 0), 1, colors.black),
    #     ("LINEBELOW", (0, -1), (-1, -1), 1, colors.black),

    #     # Each row bottom line
    #     ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.grey),

    #     ("LEFTPADDING", (0, 0), (-1, -1), 8),
    #     ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    #     ("TOPPADDING", (0, 0), (-1, -1), 6),
    #     ("BOTTOMPADDING", (0, 0), (-1, -1), 6),

    #     # REMOVE BULLETS COMPLETELY
    #     ("LISTSTYLE", (0,0), (-1,-1), None),
    # ]))

    # table.wrapOn(pdf, width, height)
    # table.drawOn(pdf, 2*cm, sal_box_top - sal_box_height + 0.5*cm)
   

    # ======================================================
    # SIGNATURE
    # ======================================================
    pdf.setFont("Helvetica", 11)
    pdf.drawString( sal_box_width - 2.3 * cm, 2.7 * cm, "Authorized Signature:")

    try:
        sig = load_image_as_jpeg(SIGNATURE_PATH)
        pdf.drawImage(sig,sal_box_width - 2.3 * cm, -2 * cm, width=4* cm, preserveAspectRatio=True)
    except:
        pdf.drawString(sal_box_width - 2.3 * cm, 1.9 * cm, "(Signature Missing)")

    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer
