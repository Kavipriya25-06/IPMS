# from django.db import models
# from django.db import transaction
# from django.db import models, transaction
# from django.db import models
# from django.db import transaction
# from django.db import models, transaction
# from django.db import models, transaction
# from django.db import models, transaction
# # from new_app_structure.models import po_master
# from django.db import models
# from django.db.models.functions import Lower
# from django.contrib.auth.hashers import make_password


# class VendorList(models.Model):
#     vendor_id = models.CharField(
#         max_length=10, unique=True, editable=False, primary_key=True
#     )
#     vendor_name = models.CharField(max_length=255, unique=True)
#     gstn = models.CharField(max_length=50, blank=True)
#     active = models.BooleanField(default=True)

#     def save(self, *args, **kwargs):
#         if not self.vendor_id:
#             with transaction.atomic():
#                 last_vendor_id = VendorList.objects.select_for_update().aggregate(
#                     models.Max("vendor_id")
#                 )["vendor_id__max"]

#                 if last_vendor_id:
#                     last_num = int(last_vendor_id.split("_")[1])
#                     new_num = last_num + 1
#                     self.vendor_id = f"V_{new_num:05d}"  # Updated prefix to 'V'
#                 else:
#                     self.vendor_id = "V_00001"  # Fixed the typo here
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.vendor_name


# class VendorSubList(models.Model):
#     CATEGORY_CHOICES = [
#         ("Airframe", "Airframe"),
#         ("Communication", "Communication"),
#         ("Electricals", "Electricals"),
#         ("Electronics", "Electronics"),
#         ("Payload", "Payload"),
#         ("Tools","Tools"),
#     ]

#     vendor = models.ForeignKey(
#         VendorList, related_name="contacts", on_delete=models.CASCADE
#     )
#     point_of_contact = models.CharField(max_length=255, blank=True)
#     email = models.EmailField(blank=True)
#     phone_number = models.CharField(max_length=10, blank=True)
#     location = models.CharField(max_length=955, blank=True)
#     # category = models.CharField(max_length=50,choices=CATEGORY_CHOICES)
#     default_poc = models.BooleanField()

#     def __str__(self):
#         return f"{self.point_of_contact} ({self.vendor.vendor_name})"


# class VendorMaster(models.Model):

#     component_type_list = [
#        ("Accessories", "Accessories"),
#         ("Actuator","Actuator"),
#         # ("Ac Sheet-waterjet cutting", "Ac Sheet-waterjet cutting"),
#         ("Adapter", "Adapter"),
#         ("Antenna", "Antenna"),
#         ("Balsa Sheet","Balsa Sheet"),
#         ("Battery", "Battery"),
#         # ("Battery Charger", "Battery Charger"),
#         # ("Battery strap", "Battery strap"),
#         ("BEC", "BEC"),
#         # ("Brass Insert", "Brass Insert"),
#         ("Breakout Module", "Breakout Module"),
#         ("Buzzer", "Buzzer"),
#         ("Cables", "Cables"),
#         ("Camera", "Camera"),
#         ("CAN Node", "CAN Node"),
#         ("Capacitor", "Capacitor"),
#         # ("Carbon Fibre", "Carbon Fibre"),
#         ("Carrycase", "Carrycase"),
#         ("CF Sheet", "CF Sheet"),
#         ("CF Tube", "CF Tube"),
#         # ("CF Sheet-waterjet cutting", "CF Sheet-waterjet cutting"),
#         ("Charger", "Charger"),
#         ("CNC cutting","CNC cutting"),
#         ("Computational Board", "Computational Board"),
#         ("Connectors", "Connectors"),
#         ("Consumables", "Consumables"),
#         # ("Controller", "Controller"),
#         ("Converter", "Converter"),
#         ("Crimp Cable", "Crimp Cable"),
#         ("Dampner", "Dampner"),
#         ("Diode", "Diode"),
#         ("Drone Frame parts", "Drone Frame parts"),
#         ("ESC", "ESC"),
#         ("Evaluation Kit", "Evaluation Kit"),
#         # ("Fasteners", "Fasteners"),
#         ("Flight controller", "Flight controller"),
#         ("Foam", "Foam"),
#         ("FPV Goggles", "FPV Goggles"),
#         # ("Frame parts & Tank", "Frame parts & Tank"),
#         ("GF Sheet", "GF Sheet"),
#         ("Gimbal", "Gimbal"),
#         ("GPS", "GPS"),
#         ("I2C Adapter", "I2C Adapter"),
#         ("Interface Board", "Interface Board"),
#         ("LCD", "LCD"),
#         # ("Lipo Checker", "Lipo Checker"),
#         # ("Locknut", "Locknut"),
#         ("Micro Controller", "Micro Controller"),
#         ("Mini Carrier Board", "Mini Carrier Board"),
#         ("Mosfet", "Mosfet"),
#         ("Motor", "Motor"),
#         ("Motors ESC & Propeller Combo", "Motors ESC & Propeller Combo"),
#         ("Mount", "Mount"),
#         ("NPNT Module", "NPNT Module"),
#         ("Oscilloscope", "Oscilloscope"),
#         ("OSD", "OSD"),
#         # ("Painting", "Painting"),
#         ("Parachute", "Parachute"),
#         ("PCB", "PCB"),
#         ("PDB", "PDB"),
#         ("Peripheral Control Module","Peripheral Control Module"),
#         ("Propellers", "Propellers"),
#         ("Quick Release", "Quick Release"),
#         ("Receiver","Receiver"),
#         ("Relay", "Relay"),
#         ("Remote Controller", "Remote Controller"),
#         ("Resistors", "Resistors"),
#         ("RF Power Meter","RF Power Meter"),
#         # ("Screws", "Screws"),
#         ("SD Card", "SD Card"),
#         ("Sensor", "Sensor"),
#         # ("Servo", "Servo"),
#         ("Servo Tester", "Servo Tester"),
#         # ("Shock Absorber", "Shock Absorber"),
#         ("Simulator Kit", "Simulator Kit"),
#         # ("Sleeve", "Sleeve"),
#         # ("Spacers","Spacers",),
#         ("Spark Plug", "Spark Plug"),
#         ("Sprayer System", "Sprayer System"),
#         # ("Tank", "Tank"),
#         ("Telemetry Module", "Telemetry Module"),
#         ("Transmitter", "Transmitter"),
#         ("Transreceiver", "Transreceiver"),
#         ("UIN Plate", "UIN Plate"),
#         # ("Velcro", "Velcro"),
#         ("Voltmeter", "Voltmeter"),
#         ("VRX", "VRX"),
#         # ("Washers", "Washers"),
#         ("Waterjet Cutting", "Waterjet Cutting"),
#         ("Wifi Module","Wifi Module"),
#         ("Winch", "Winch"),
#         ("3D Printed Parts", "3D Printed Parts"),

#     ]

#     CATEGORY_CHOICES = [
#         ("Airframe", "Airframe"),
#         ("Communication", "Communication"),
#         ("Electricals", "Electricals"),
#         ("Electronics", "Electronics"),
#         ("Payload", "Payload"),
#         ("Accessories", "Accessories"),
#         ("Tools","Tools"),
#     ]

#     vendor = models.ForeignKey(
#         VendorList, on_delete=models.CASCADE, related_name="vendor_master"
#     )
#     component_id = models.ForeignKey("ComponentMaster", on_delete=models.CASCADE)

#     product_description = models.TextField()
#     unit_of_measurement = models.CharField(max_length=100)
#     img = models.ImageField(upload_to="media/images/images/component_images/", blank=True, null=True)
#     attachments = models.FileField(upload_to="attachments/", blank=True, null=True)
#     product_id = models.CharField(max_length=100, primary_key=True, blank=True)
#     # last_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True)
#     category = models.CharField(max_length=255, choices=CATEGORY_CHOICES)
#     component_type = models.CharField(max_length=50, choices=component_type_list)
#     component_specification = models.TextField()
#     # unit_of_measurement = models.CharField(max_length=100)
#     # tax = models.IntegerField(blank=True)
#     active = models.BooleanField(default=True)
#     remarks = models.CharField(max_length=300,blank=True,null=True,default="")
    

#     def save(self, *args, **kwargs):
#         if not self.product_id:
#             with transaction.atomic():
#                 last_product_id = VendorMaster.objects.select_for_update().aggregate(
#                     models.Max("product_id")
#                 )["product_id__max"]

#                 if last_product_id:
#                     last_num = int(last_product_id.split("P")[1])
#                     new_num = last_num + 1
#                     self.product_id = f"P{new_num:04d}"  # Updated prefix to 'P' P followed by 4 digits
#                 else:
#                     self.product_id = "P0001"  # Fixed the typo here
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.product_id} - {self.product_description}"


# class VendorProductImage(models.Model):
#     component = models.ForeignKey(
#         'ComponentMaster',  #  String reference avoids NameError
#         on_delete=models.CASCADE,
#         related_name='images'
#     )
#     image = models.ImageField(upload_to='images/component_images/')
#     uploaded_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Image for {self.component.component_id}"



# class price_table(models.Model):
#     product = models.ForeignKey(VendorMaster, on_delete=models.CASCADE)
#     current_time = models.DateTimeField()
#     tax = models.IntegerField()
#     price = models.DecimalField(max_digits=20, decimal_places=10)  
#     delivery_days = models.PositiveIntegerField(null=True, blank=True)
 

# class ComponentMaster(models.Model):
#     component_id = models.CharField(max_length=10, primary_key=True, blank=True)
#     category = models.CharField(max_length=255, blank=True)
#     component_type = models.CharField(max_length=255, blank=True)
#     component_specification = models.TextField(blank=True)
#     unit_of_measurement = models.CharField(max_length=100, blank=True)
#     # product_id = models.ForeignKey(VendorMaster, on_delete=models.CASCADE)
#     # vendor_id = models.ForeignKey(VendorList, on_delete=models.CASCADE)
    
#     hsn_numbers = models.JSONField(default=list, blank=True)    
#     sku_numbers = models.JSONField(default=list, blank=True)    
#     part_numbers = models.JSONField(default=list, blank=True)   
    
    
#     ordering_id = models.IntegerField(
#         unique=True, blank=True, null=True
#     )  # New unique integer field for ordering6
#     tally_reference = models.CharField(max_length=255,blank=True)

#     class Meta:
#         ordering = ["ordering_id"]

#     def save(self, *args, **kwargs): 
#         if not self.component_id:
#             with transaction.atomic():
#                 last_component_id = (
#                     ComponentMaster.objects.select_for_update().aggregate(
#                         models.Max("component_id")
#                     )["component_id__max"]
#                 )

#                 if last_component_id:
#                     last_num = int(last_component_id.split("_")[1])
#                     new_num = last_num + 1
#                     self.component_id = f"C_{new_num:05d}"
#                 else:
#                     self.component_id = "C_00001"
#         super().save(*args, **kwargs)

#     def __str__(self):
#         # return self.component_id
#         return f"{self.component_id} - {self.component_type} - {self.component_specification}"


# class RequestComponent(models.Model):
#     component_type_list = [
#         ("Accessories", "Accessories"),
#         ("Actuator","Actuator"),
#         # ("Ac Sheet-waterjet cutting", "Ac Sheet-waterjet cutting"),
#         ("Adapter", "Adapter"),
#         ("Antenna", "Antenna"),
#         ("Balsa Sheet","Balsa Sheet"),
#         ("Battery", "Battery"),
#         # ("Battery Charger", "Battery Charger"),
#         # ("Battery strap", "Battery strap"),
#         ("BEC", "BEC"),
#         # ("Brass Insert", "Brass Insert"),
#         ("Breakout Module", "Breakout Module"),
#         ("Buzzer", "Buzzer"),
#         ("Cables", "Cables"),
#         ("Camera", "Camera"),
#         ("CAN Node", "CAN Node"),
#         ("Capacitor", "Capacitor"),
#         # ("Carbon Fibre", "Carbon Fibre"),
#         ("Carrycase", "Carrycase"),
#         ("CF Sheet", "CF Sheet"),
#         ("CF Tube", "CF Tube"),
#         # ("CF Sheet-waterjet cutting", "CF Sheet-waterjet cutting"),
#         ("Charger", "Charger"),
#         ("CNC cutting","CNC cutting"),
#         ("Computational Board", "Computational Board"),
#         ("Connectors", "Connectors"),
#         ("Consumables", "Consumables"),
#         # ("Controller", "Controller"),
#         ("Converter", "Converter"),
#         ("Crimp Cable", "Crimp Cable"),
#         ("Dampner", "Dampner"),
#         ("Diode", "Diode"),
#         ("Drone Frame parts", "Drone Frame parts"),
#         ("Data Link", "Data Link"),
#         ("ESC", "ESC"),
#         ("Evaluation Kit", "Evaluation Kit"),
#         # ("Fasteners", "Fasteners"),
#         ("Flight controller", "Flight controller"),
#         ("Foam", "Foam"),
#         ("FPV Goggles", "FPV Goggles"),
#         # ("Frame parts & Tank", "Frame parts & Tank"),
#         ("GF Sheet", "GF Sheet"),
#         ("Gimbal", "Gimbal"),
#         ("GPS", "GPS"),
#         ("I2C Adapter", "I2C Adapter"),
#         ("Interface Board", "Interface Board"),
#         ("LCD", "LCD"),
#         # ("Lipo Checker", "Lipo Checker"),
#         # ("Locknut", "Locknut"),
#         ("Micro Controller", "Micro Controller"),
#         ("Mini Carrier Board", "Mini Carrier Board"),
#         ("Mosfet", "Mosfet"),
#         ("Motor", "Motor"),
#         ("Motors ESC & Propeller Combo", "Motors ESC & Propeller Combo"),
#         ("Mount", "Mount"),
#         ("NPNT Module", "NPNT Module"),
#         ("Oscilloscope", "Oscilloscope"),
#         ("OSD", "OSD"),
#         # ("Painting", "Painting"),
#         ("Parachute", "Parachute"),
#         ("PCB", "PCB"),
#         ("PDB", "PDB"),
#         ("Peripheral Control Module","Peripheral Control Module"),
#         ("Propellers", "Propellers"),
#         ("Quick Release", "Quick Release"),
#         ("Receiver","Receiver"),
#         ("Relay", "Relay"),
#         ("Remote Controller", "Remote Controller"),
#         ("Resistors", "Resistors"),
#         ("RF Power Meter","RF Power Meter"),
#         # ("Screws", "Screws"),
#         ("SD Card", "SD Card"),
#         ("Sensor", "Sensor"),
#         # ("Servo", "Servo"),
#         ("Servo Tester", "Servo Tester"),
#         # ("Shock Absorber", "Shock Absorber"),
#         ("Simulator Kit", "Simulator Kit"),
#         # ("Sleeve", "Sleeve"),
#         # ("Spacers","Spacers",),
#         ("Spark Plug", "Spark Plug"),
#         ("Sprayer System", "Sprayer System"),
#         # ("Tank", "Tank"),
#         ("Telemetry Module", "Telemetry Module"),
#         ("Transmitter", "Transmitter"),
#         ("Transreceiver", "Transreceiver"),
#         ("UIN Plate", "UIN Plate"),
#         # ("Velcro", "Velcro"),
#         ("Voltmeter", "Voltmeter"),
#         ("VRX", "VRX"),
#         # ("Washers", "Washers"),
#         ("Waterjet Cutting", "Waterjet Cutting"),
#         ("Wifi Module","Wifi Module"),
#         ("Winch", "Winch"),
#         ("3D Printed Parts", "3D Printed Parts"),

#     ]


#     CATEGORY_CHOICES = [
#         ("Accessories", "Accessories"),
#         ("Airframe", "Airframe"),
#         ("Communication", "Communication"),
#         ("Electricals", "Electricals"),
#         ("Electronics", "Electronics"),
#         ("Payload", "Payload"),
#         ("Tools","Tools"),
       
#     ]

#     name = models.CharField(max_length=255)
#     request_date = models.DateField(auto_now_add=True)
#     category = models.CharField(max_length=255, choices=CATEGORY_CHOICES)
#     component_type = models.CharField(max_length=255, choices=component_type_list)
#     component_specification = models.TextField()
#     uom = models.CharField(max_length=100)
#     product_link = models.URLField(blank=True, null=True,max_length=7000)
#     status = models.CharField(
#         max_length=50,
#         choices=[("Pending", "Pending"), ("Rejected", "Rejected"), ("Added", "Added")],
#         default="Pending"
#     )
#     # reason = models.TextField(blank=True, null=True)
#     remarks = models.TextField(blank=True, null=True)
#     component_id = models.CharField(max_length=50, blank=True, null=True)
#     vendor_added = models.BooleanField(default=False)

#     hsn_number = models.CharField(max_length=50, blank=True, null=True)
#     sku_number = models.CharField(max_length=50, blank=True, null=True)
#     part_number = models.CharField(max_length=50, blank=True, null=True)


#     def __str__(self):
#         return f"{self.name} - {self.component_type}"



# class meta_tags(models.Model):
#     tags = models.CharField(max_length=100)
#     component_id = models.ForeignKey(ComponentMaster, on_delete=models.CASCADE)


# class create_tags(models.Model):
#     tags = models.CharField(max_length=100)


# class tags_table(models.Model):
#     tags_choices = models.ForeignKey(create_tags, on_delete=models.CASCADE)
#     component_id = models.ForeignKey(ComponentMaster, on_delete=models.CASCADE)
#     tags = models.CharField(max_length=100)


# class Inventory(models.Model):
#     STATUS_CHOICES = [
#         ("Available", "Available"),
#         ("Reserved", "Reserved"),
#         ("In_drone", "In_drone"),
#         ("Damaged", "Damaged"),
#         ("Repair", "Repair"),
#     ]

#     component_id = models.CharField(max_length=50)
#     serial_number = models.CharField(
#         primary_key=True, max_length=50, unique=True, blank=True
#     )
#     component_type = models.CharField(max_length=100)
#     vendor_name = models.CharField(max_length=100)
#     category = models.CharField(max_length=50)
#     specification = models.CharField(max_length=300)
#     UOM = models.CharField(max_length=20)
#     create_date = models.DateField(auto_now_add=True)
#     status = models.CharField(
#         max_length=20, choices=STATUS_CHOICES, default="Available"
#     )
#     price = models.DecimalField(max_digits=20, decimal_places=10)
#     gst = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
#     total_price = models.DecimalField(max_digits=20, decimal_places=10)


#     sku_number_inventory = models.CharField(max_length=50, blank=True)
#     Request_id_assign = models.CharField(max_length=50, blank=True)
#     remarks = models.CharField(max_length=500, blank=True)

#     is_taken = models.BooleanField(default=False)
#     taken_by = models.CharField(max_length=255, blank=True, null=True)
#     taken_date = models.DateField(blank=True, null=True)
#     return_date = models.DateField(blank=True, null=True)

#     def save(self, *args, **kwargs):
#         from .models import Reserved  # Avoid circular import

#         super().save(*args, **kwargs)  # Save the Inventory instance first

#         # If status is "reserved", add to Reserved table
#         if self.status == "Reserved":
#             Reserved.objects.get_or_create(serial_number=self)
#         else:
#             # If status changes from "reserved" to something else, delete from Reserved table
#             Reserved.objects.filter(serial_number=self).delete()

#     def __str__(self):
#         return f"{self.serial_number} - {self.status}" 


# class Reserved(models.Model):
#     serial_number = models.ForeignKey(Inventory, on_delete=models.CASCADE)
#     status = models.CharField(max_length=50, default="Reserved")
#     Reserved_date=models.DateField(auto_now_add=True)

#     def save(self, *args, **kwargs):
#         from .models import Inventory

#         super().save(*args, **kwargs)
#         if self.status == "Reserved":
#             Inventory.objects.filter(serial_number=self.serial_number).update(
#                 status="Reserved"
                
#             )
#         else:
#             Inventory.objects.filter(serial_number=self.serial_number).update(
#                 status="Available"
#             )


# from django.db import models, transaction


# class create_MRF(models.Model):

    
#     MRF_id = models.CharField(max_length=100, primary_key=True, blank=True)
#     create_date = models.DateField(auto_now_add=True)
#     name = models.CharField(max_length=100)
#     date = models.DateField()
#     Request_id_assign = models.CharField(max_length=50, blank=True)
#     approval = models.BooleanField(default=False)

#     def save(self, *args, **kwargs):
#         from .models import (
#             Inventory,
#         )  # Import inside function to avoid circular imports

#         if not self.MRF_id:
#             with transaction.atomic():
#                 last_MRF = (
#                     create_MRF.objects.select_for_update().order_by("-MRF_id").first()
#                 )

#                 if last_MRF and last_MRF.MRF_id.startswith("MRF_"):
#                     try:
#                         last_num = int(last_MRF.MRF_id.split("_")[1])
#                         new_num = last_num + 1
#                         self.MRF_id = f"MRF_{new_num:05d}"
#                     except (ValueError, IndexError):
#                         self.MRF_id = "MRF_00001"
#                 else:
#                     self.MRF_id = "MRF_00001"

#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"MRF_id: {self.MRF_id}"


# class MRFList(models.Model):
#     """
#     Stores MRF details, linked to CreateMRF.
#     """

#     MRF_id = models.ForeignKey(
#         create_MRF, on_delete=models.CASCADE, related_name="mrf_items"
#     )
#     serial_number = models.ForeignKey("Inventory", on_delete=models.CASCADE)
#     component_type = models.CharField(max_length=100)
#     component_specification = models.TextField()
#     unit_of_measurement = models.CharField(max_length=100)
#     category = models.CharField(max_length=255)
#     status = models.CharField(max_length=100, blank=True)
#     returns = models.CharField(max_length=100, blank=True)
#     remarks = models.CharField(max_length=100, blank=True)
#     reported_by = models.CharField(max_length=100, blank=True)
#     action = models.BooleanField(default=False)
#     quantity = models.IntegerField(default=1, blank=True, null=True)

#     def __str__(self):
#         return f"MRF ID: {self.MRF_id.MRF_id} | Serial: {self.serial_number}"

# class MRFsubList(models.Model):
#     """
#     Stores MRF details, linked to CreateMRF.
#     """

#     MRF_id = models.ForeignKey(
#         create_MRF, on_delete=models.CASCADE, related_name="mrf_sub_items"
#     )
#     quantity = models.IntegerField()
#     component_type = models.CharField(max_length=100)
#     component_specification = models.TextField()
#     unit_of_measurement = models.CharField(max_length=100)
#     category = models.CharField(max_length=255)
#     status = models.CharField(max_length=100, blank=True)
#     component_id = models.CharField(max_length=50)
   

#     def __str__(self):
#         return f"MRF ID: {self.MRF_id.MRF_id} | Serial: {self.component_id}"



# class Reserved_list(models.Model):
#     MRF_id = models.ForeignKey(create_MRF, on_delete=models.CASCADE)


# class BOMList(models.Model):
#     bom_id = models.CharField(max_length=100, primary_key=True, unique=True, blank=True)
#     bom_name = models.CharField(max_length=255)
#     number_of_components = models.IntegerField(blank=True)
#     created_by = models.CharField(max_length=255)
#     created_date = models.DateField(auto_now_add=True)
#     last_modified_by = models.CharField(max_length=255)
#     last_modified_date = models.DateField(auto_now=True)
#     wbom = models.BooleanField(default=True)

#     """
#     Overrides the save method to generate a unique bom_id if it doesn't exist.

#     The bom_id is generated by incrementing the last bom_id in the database.
#     If no bom_id exists, it is initialized to 'B_00001'.
#     """

#     def save(self, *args, **kwargs):
#         if not self.bom_id:  # Generate bom_id only if not already set
#             with transaction.atomic():
#                 # Lock the BOMList table to avoid race conditions
#                 last_bom_id = BOMList.objects.select_for_update().aggregate(
#                     models.Max("bom_id")  # Fetch the max bom_id
#                 )["bom_id__max"]

#                 if last_bom_id:
#                     # Extract the numeric part and increment
#                     last_num = int(last_bom_id.split("_")[1])
#                     new_num = last_num + 1
#                     self.bom_id = f"B_{new_num:05d}"  # Generate the new bom_id
#                 else:
#                     self.bom_id = "B_00001"  # Default starting bom_id

#         # Call the parent save method
#         super().save(*args, **kwargs)


# class BOMMaster(models.Model):
#     bom = models.ForeignKey(
#         BOMList, on_delete=models.CASCADE, related_name="bom_master"
#     )
#     component = models.ForeignKey(ComponentMaster, on_delete=models.CASCADE)
#     quantity = models.IntegerField()
#     vendor = models.ForeignKey(VendorList, on_delete=models.CASCADE)
#     price = models.DecimalField(max_digits=20,decimal_places=10)
#     tax = models.DecimalField(max_digits=5,decimal_places=2)
#     date = models.DateField()


#     def __str__(self):
#         return f"{self.bom} - {self.component}"


# class project_details(models.Model):

#     project_name = models.CharField(max_length=100)
#     project_id = models.CharField(max_length=10, primary_key=True, blank=True)
#     description = models.TextField()
#     start_date = models.DateField()
#     RequestList_id = models.CharField(max_length=50, blank=True)
#     project_type = models.CharField(max_length=100, blank=True)

#     def save(self, *args, **kwargs):
#         if not self.project_id:
#             with transaction.atomic():
#                 # Get the last project ID
#                 last_project_id = project_details.objects.select_for_update().aggregate(
#                     models.Max("project_id")
#                 )["project_id__max"]

#                 # Check if last_project_id exists and is valid
#                 if last_project_id:
#                     try:
#                         last_num = int(last_project_id.split("_")[1])
#                         new_num = last_num + 1
#                         self.project_id = f"PRJ_{new_num:05d}"
#                     except (IndexError, ValueError):
#                         # Handle case where last_project_id is invalid
#                         self.project_id = "PRJ_00001"
#                 else:
#                     # Default for first project ID
#                     self.project_id = "PRJ_00001"

#         # Save the object
#         super().save(*args, **kwargs)


# class RequestList(models.Model):
#     request_id = models.CharField(
#         max_length=10, unique=True, editable=False, primary_key=True
#     )
#     requester_name = models.CharField(max_length=255)
#     description = models.CharField(max_length=200, blank=True, null=True)
#     date = models.DateField(auto_now_add=True)
#     status = models.CharField(max_length=50)
#     last_modified_by = models.CharField(max_length=255)
#     # bom = models.ForeignKey(BOMMaster, on_delete=models.CASCADE)
#     bom = models.ForeignKey(BOMList, on_delete=models.CASCADE)
#     bom_name = models.CharField(max_length=255, blank=True)

#     def save(self, *args, **kwargs):
#         if not self.request_id:
#             with transaction.atomic():
#                 last_request_id = RequestList.objects.select_for_update().aggregate(
#                     models.Max("request_id")
#                 )["request_id__max"]

#                 if last_request_id:
#                     last_num = int(last_request_id.split("_")[1])
#                     new_num = last_num + 1
#                     self.request_id = f"R_{new_num:05d}"
#                 else:
#                     self.request_id = "R_00001"
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.requester_name


# class RequestMaster(models.Model):
#     request = models.ForeignKey(RequestList, on_delete=models.CASCADE)
#     component = models.ForeignKey(ComponentMaster, on_delete=models.CASCADE)
#     vendor = models.ForeignKey(VendorList, on_delete=models.CASCADE)
#     # bom = models.ForeignKey(BOMMaster, on_delete=models.CASCADE)
#     status = models.CharField(max_length=100)
#     qty = models.IntegerField()
#     assign = models.BooleanField()
#     cart_assign = models.BooleanField(default=False)
#     approve = models.BooleanField(default=False)

#     # next rime push check this field naveen working on

#     project_id = models.ForeignKey(project_details, on_delete=models.CASCADE)

#     def __str__(self):
#         return f"Request {self.request} for {self.component}"

#     @property
#     def po_statuses(self):
#         # Fetch related PO statuses
#         related_po_links = RequestToPO.objects.filter(
#             request=self.request
#         ).select_related("po")
#         return [
#             {"po_id": po.po.id, "po_status": po.po.status} for po in related_po_links
#         ]


# from django.db import models, transaction


# # Cart Model
# class cart(models.Model):
#     component_id = models.CharField(max_length=10)
#     category = models.CharField(max_length=255)
#     component_type = models.CharField(max_length=255)
#     component_specification = models.TextField()
#     unit_of_measurement = models.CharField(max_length=100)
#     vendor_name = models.CharField(max_length=100)
#     quantity = models.PositiveIntegerField()  # Ensures non-negative values
#     vendor_id = models.CharField(max_length=10)
#     unit_price = models.DecimalField(max_digits=20, decimal_places=10)
#     GST = models.DecimalField(max_digits=5, decimal_places=2)
#     total_cost = models.DecimalField(max_digits=20, decimal_places=10)
#     order_placed = models.BooleanField(default=False)
#     date = models.DateField(auto_now_add=True, blank=True)
#     gstn = models.CharField(max_length=50, blank=True)
#     request_list_id =models.CharField(max_length=10)

#     # request _status

#     request_id = models.ForeignKey(RequestMaster, on_delete=models.CASCADE)

#     def __str__(self):
#         return f"Vendor: {self.vendor_name}, Component: {self.component_id}"


# # Purchase Order List Model
# class po_list(models.Model):
#     id = models.CharField(max_length=50, primary_key=True, blank=True)
#     # status = models.CharField(max_length=50)
#     date = models.DateField(auto_now_add=True, blank=True)
#     cart_id = models.ForeignKey(cart, on_delete=models.CASCADE)
#     # vendor_name=models.CharField(max_length=100)

#     def save(self, *args, **kwargs):
#         if not self.id:
#             with transaction.atomic():
#                 last_po = po_list.objects.select_for_update().aggregate(
#                     models.Max("id")
#                 )["id__max"]

#                 if last_po:
#                     last_num = int(last_po.split("_")[1])
#                     new_num = last_num + 1
#                     self.id = f"PO_{new_num:05d}"
#                 else:
#                     self.id = "PO_00001"
#         super().save(*args, **kwargs)

#     def __str__(self):
#         latest_master = self.po_master_set.last()
#         status = latest_master.status if latest_master else "N/A"
#         return f"PO ID: {self.id}, Status: {status}"



# class RequestToPO(models.Model):
#     request = models.ForeignKey("RequestList", on_delete=models.CASCADE)
#     po = models.ForeignKey("po_list", on_delete=models.CASCADE)

#     def __str__(self):
#         return f"Request ID: {self.request.request_id} <-> PO ID: {self.po.id}"


# class qc_component_type(models.Model):
#     component_type = models.CharField(max_length=100, unique=True)  # simple uniqueness

#     class Meta:
#         constraints = [
#             # Optional: case-insensitive uniqueness (Django 4.2+; may require proper DB support)
#             models.UniqueConstraint(
#                 Lower('component_type'),
#                 name='uq_qc_component_type_ci'
#             )
#         ]


# class qc_question(models.Model):

#     component_type = models.ForeignKey(qc_component_type, on_delete=models.CASCADE)
#     question = models.CharField(max_length=100)


# class qc_answer(models.Model):

#     qc_question = models.ForeignKey(qc_question, on_delete=models.CASCADE)
#     yes = models.BooleanField()
#     no = models.BooleanField()
#     Inward_id = models.CharField(max_length=50)
#     gray_status = models.BooleanField(default=True)


# class qc_return_answer(models.Model):

#     qc_question = models.ForeignKey(qc_question, on_delete=models.CASCADE)
#     yes = models.BooleanField()
#     no = models.BooleanField()
#     serial_number = models.CharField(max_length=50)
#     gray_status = models.BooleanField(default=True)


# # Purchase Order Master Model
# class po_master(models.Model):
#     STATUS_CHOICES = [
#         ('Pending', 'Pending'),
#         ('Approved', 'Approved'),
#         ('Rejected', 'Rejected'),
#         ('Ordered', 'Ordered'),
#         ('Cancelled', 'Cancelled'),
#         ('Shipped', 'Shipped'), 
#         ('Received', 'Received'),
#     ]
      
#     PO_id = models.ForeignKey(po_list, on_delete=models.CASCADE)
#     status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
#     cart_id = models.ForeignKey(cart, on_delete=models.CASCADE)
#     inward_status = models.BooleanField(default=True)
#     edited_quantity =  models.PositiveIntegerField(default=0)
#     edited_total_cost = models.DecimalField(max_digits=20, decimal_places=10, default=0) 
#     # gstn=models.CharField(max_length=50,blank=True)

#     def __str__(self):
#         return f"PO: {self.PO_id}, Status: {self.status}"


# class PODelivery(models.Model):
#     po_master = models.ForeignKey(po_master, on_delete=models.CASCADE)
#     component_id = models.CharField(max_length=50)  # New field
#     specification = models.CharField(max_length=200)  # New field

#     quantity = models.PositiveIntegerField()  # Ordered Qty
#     order_placed_date_time = models.DateTimeField(blank=True, null=True)  # Ordered Date

#     shipped_quantity = models.PositiveIntegerField(default=0)
#     shipped_date = models.DateTimeField(blank=True, null=True)

#     received_quantity = models.PositiveIntegerField(default=0)
#     received_date = models.DateTimeField(blank=True, null=True)

#     inward = models.BooleanField(default=False)  # Inward Status
#     pending_quantity = models.PositiveIntegerField(default=0)

#     def __str__(self):
#         return f"{self.po_master.cart_id.component_id or 0} - {self.quantity} units"
    
# # Order Status Model
# class order_status(models.Model):
#     po_master_id = models.ForeignKey(po_master, on_delete=models.CASCADE)
#     order_placed_status = models.CharField(max_length=100)
#     order_placed_date_time = models.DateTimeField(blank=True, null=True)
#     customer_status = models.CharField(max_length=100, blank=True)
#     customer_date_time = models.DateTimeField(blank=True, null=True)
#     received_status = models.CharField(max_length=100, blank=True)
#     received_date = models.DateTimeField(blank=True, null=True)
#     # component_id = models.CharField(max_length=50)

#     def __str__(self):
#         return f"Order Placed: {self.order_placed_status}, Received: {self.received_status}"


# import re
# from django.db import models, transaction

# try:
#     # if Inventory model lives alongside Inward
#     from new_app_structure.models import Inventory  # <-- change if needed
# except Exception:
#     Inventory = None
#     # Or, if it lives under Inventory_api:
#     # from new_app_structure.Inventory_api.models import Inventory  # uncomment + delete the try/except

# class Inward(models.Model):
#     inward_id = models.CharField(max_length=50, primary_key=True, blank=True)
#     po_master_id = models.ForeignKey(po_master, on_delete=models.CASCADE)
#     serial_number = models.CharField(max_length=50, blank=True)
#     quality_check = models.CharField(max_length=20)
#     date = models.DateTimeField(auto_now_add=True)
#     component_id = models.CharField(max_length=50)
#     mode_to_inventory = models.BooleanField(default=True)
#     price = models.DecimalField(max_digits=20, decimal_places=10)
#     sku_number = models.CharField(max_length=50, blank=True)

#     invoice_number = models.CharField(max_length=100, blank=True, null=True)
#     invoice_date = models.DateField(blank=True, null=True)
#     gst = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

#     # ---------- helpers ----------
#     @staticmethod
#     def _extract_s_num(serial: str) -> int:
#         """
#         Extracts the trailing S-number from a serial like 'C_00001S00037' -> 37.
#         Returns 0 if it cannot parse.
#         """
#         if not serial:
#             return 0
#         m = re.search(r"S(\d+)$", serial)
#         return int(m.group(1)) if m else 0
 
#     def _next_serial_for_component(self) -> str:
#         """
#         Compute next serial by scanning BOTH Inward and Inventory
#         for the same component_id and taking the max S-number.
#         """
#         max_num = 0

#         # Lock Inward rows for this component so concurrent QC-pass
#         # transactions don't pick the same number.
#         inward_serials = (
#             Inward.objects.select_for_update()
#             .filter(component_id=self.component_id)
#             .values_list("serial_number", flat=True)
#         )
#         for s in inward_serials:
#             max_num = max(max_num, self._extract_s_num(s))

#         # Also scan Inventory (cannot row-lock here easily, but reading max is fine)
#         if Inventory is not None:
#             inv_serials = (
#                 Inventory.objects.filter(component_id=self.component_id)
#                 .values_list("serial_number", flat=True)
#             )
#             for s in inv_serials:
#                 max_num = max(max_num, self._extract_s_num(s))

#         # build the new serial: C_00001S00042, etc.
#         comp_num = int(self.component_id.split("_")[-1])
#         return f"C_{comp_num:05d}S{max_num + 1:05d}"

#     def save(self, *args, **kwargs):
#         # Generate inward_id if not already set
#         if not self.inward_id:
#             with transaction.atomic():
#                 last_inward = (
#                     Inward.objects.select_for_update()
#                     .aggregate(models.Max("inward_id"))
#                     ["inward_id__max"]
#                 )
#                 if last_inward:
#                     last_num = int(last_inward.split("_")[1])
#                     new_num = last_num + 1
#                     self.inward_id = f"IW_{new_num:05d}"
#                 else:
#                     self.inward_id = "IW_00001"

#         # Generate serial_number only when QC passed and component set
#         if getattr(self, "quality_check", "") and self.component_id:
#             if self.quality_check.lower() == "pass" and not self.serial_number:
#                 with transaction.atomic():
#                     # compute next serial across BOTH tables
#                     self.serial_number = self._next_serial_for_component()

#         super().save(*args, **kwargs)


# class email(models.Model):

#     file = models.FileField(upload_to="email_attachments/")


# from django.contrib.auth.models import AbstractUser, Group, Permission
# from django.db import models


# class CustomUser(AbstractUser):
#     ROLE_CHOICES = [
#         ("admin", "Admin"),
#         ("Sub-Admin", "Sub-Admin"),
#         ("procurement_manager", "Procurement Manager"),
#         ("vendor_manager", "Vendor Manager"),
#         ("inventory_manager", "Inventory Manager"),
#         ("user", "User"),
#     ]

#     role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")

#     groups = models.ManyToManyField(
#         Group,
#         related_name="customuser_set",
#         blank=True,
#         help_text=(
#             "The groups this user belongs to. A user will get all permissions "
#             "granted to each of their groups."
#         ),
#         verbose_name="groups",
#     ) 
#     user_permissions = models.ManyToManyField(
#         Permission,
#         related_name="customuser_permissions",
#         blank=True,
#         help_text="Specific permissions for this user.",
#         verbose_name="user permissions",
#     )

# # class meta_tags(models.Model):
# #     tags=models.CharField(max_length=100)
# #     component_id=models.ForeignKey(ComponentMaster,on_delete=models.CASCADE)


# class register(models.Model):
#     name = models.CharField(max_length=100)
#     email = models.CharField(max_length=200)
#     password = models.CharField(max_length=200)
#     role = models.CharField(max_length=200)
#     status = models.BooleanField(default=True)
#     reset_token = models.CharField(max_length=128, blank=True, null=True)  # for reset link
#     token_expiry = models.DateTimeField(blank=True, null=True)


#     def save(self, *args, **kwargs):
#             #  Hash password only if not already hashed
#             if self.password and not self.password.startswith('pbkdf2_'):
#                 self.password = make_password(self.password)

#             super().save(*args, **kwargs)

# class inventory_status(models.Model):
#     status=models.CharField(max_length=100)
#     current_date_time=models.DateTimeField(auto_now_add=True)
#     serial_number=models.ForeignKey(Inventory,on_delete=models.CASCADE)



# class DamagedInventory(models.Model):
#     serial_number = models.OneToOneField(
#         Inventory,
#         on_delete=models.CASCADE,
#         primary_key=True,
#         related_name="damage_report",
#         help_text="Serial number of the damaged item",
#     )
#     component_category = models.CharField(
#         max_length=255, help_text="Category of the component"
#     )
#     component_type = models.CharField(max_length=255, help_text="Type of the component")  
#     component_specification = models.TextField(
#         help_text="Specification details of the component"
#     )
#     status = models.CharField(
#         max_length=50,
#         choices=[
#             ("damaged", "Damaged"),
#             ("repairable", "Can be Repaired"),
#             ("returned", "Returned"),
#         ], 
#         # default="damaged",
#         help_text="Current status of the item",
#     )
#     remarks = models.TextField(
#         blank=True, null=True, help_text="Additional remarks about the damage"
#     )
#     reported_by = models.CharField(
#         max_length=255, help_text="Name of the person who reported the damage"
#     )
#     reported_date = models.DateTimeField(
#         auto_now_add=True, help_text="Date and time when the damage was reported"
#     )
#     updated_date = models.DateTimeField(
#         auto_now=True, help_text="Last updated date and time"
#     )

#     def __str__(self):
#         return f"{self.serial_number.serial_number} - {self.status}"
    
# import re
# from django.db import transaction
# from django.db.models import F

# # --- Gatepass counter model stays the same ---
# class GatepassCounter(models.Model):
#     key = models.CharField(max_length=32, primary_key=True, default="gatepass")
#     last = models.PositiveIntegerField(default=0)

#     def __str__(self):
#         return f"{self.key}:{self.last}"

# # --- helpers for syncing with DB ---
# GP_RE = re.compile(r"GP[-_]?(\d+)$")

# def _max_gatepass_in_db() -> int:
#     """
#     Return the highest numeric GP value currently present in Outward.gatepass.
#     If no Outward rows have a gatepass, returns 0.
#     """
#     max_num = 0
#     # Import locally to avoid circular import issues if needed
#     from new_app_structure.models import Outward

#     qs = (
#         Outward.objects
#         .exclude(gatepass__isnull=True)
#         .exclude(gatepass="")
#         .values_list("gatepass", flat=True)
#     )
#     for gp in qs:
#         m = GP_RE.search(gp or "")
#         if m:
#             n = int(m.group(1))
#             if n > max_num:
#                 max_num = n 
#     return max_num

# def next_gatepass() -> str:
#     """
#     Returns the next gatepass like GP-00001 in a concurrency-safe way.
#     It first syncs the counter to what's actually in the DB so that if
#     you delete all Outward rows, the next value becomes GP-00001 again.
#     """
#     with transaction.atomic():
#         counter, _ = GatepassCounter.objects.select_for_update().get_or_create(key="gatepass")

#         db_max = _max_gatepass_in_db()   # e.g. 0 if table empty
#         if counter.last != db_max:
#             counter.last = db_max
#             counter.save(update_fields=["last"])

#         counter.last = F("last") + 1
#         counter.save(update_fields=["last"])
#         counter.refresh_from_db(fields=["last"])
#         return f"GP-{counter.last:05d}"
# class Outward(models.Model):
#     OUTWARD_TYPE_CHOICES = [
#         ("Project Use", "Project Use"),
#         ("Client Delivery", "Client Delivery"),
#         ("Sample", "Sample"),
#         ("Return", "Return"),
#         ("Non-Return", "Non-Return"),
#         ("Others", "Others"),
#     ]
#     OUTWARD_CATEGORY_CHOICES = [
#         ("Defects", "Defects"),
#         ("Sales", "Sales"),
#         ("Manufacture", "Manufacture"),
#         ("Event", "Event"),
#     ]

#     category = models.CharField(max_length=50, choices=OUTWARD_CATEGORY_CHOICES, default="Defects")
#     date = models.DateField(auto_now_add=True)
#     time = models.TimeField(auto_now_add=True)

#     invoice_no = models.CharField(max_length=100, blank=True, null=True)
#     vendor = models.TextField(blank=True, null=True)
#     specification = models.TextField(blank=True, null=True)
#     quantity = models.PositiveIntegerField(blank=True, null=True)
#     component_id = models.CharField(max_length=50, blank=True, null=True)
#     project = models.ForeignKey('project_details', on_delete=models.SET_NULL, null=True, blank=True)
#     type_of_outward = models.CharField(max_length=50, choices=OUTWARD_TYPE_CHOICES)
#     remarks = models.TextField(blank=True, null=True)

#     # optional csv fields
#     serial_numbers = models.TextField(blank=True, null=True)
#     attachments = models.TextField(blank=True, null=True)

#     # fields used by Event/Manufacture only (gatepass unique)
#     product_name = models.CharField(max_length=255, blank=True, null=True)
#     client = models.CharField(max_length=255, blank=True, null=True)
#     list_of_deliverables = models.TextField(blank=True, null=True)

#     gatepass = models.CharField(max_length=100, blank=True, null=True, unique=True)
#     event_name = models.CharField(max_length=255, blank=True, null=True)
#     num_components = models.PositiveIntegerField(blank=True, null=True)
#     return_date = models.DateField(blank=True, null=True)

#     def save(self, *args, **kwargs):
#         # Gatepass should exist only for Manufacture & Event
#         needs_gatepass = {"Manufacture", "Event"}
#         norm = lambda s: (s or "").strip().title()
#         current_cat = norm(self.category)

#         prev_cat = None
#         prev_gatepass = None
#         if self.pk:
#             prev = Outward.objects.filter(pk=self.pk).only("category", "gatepass").first()
#             if prev:
#                 prev_cat = norm(prev.category)
#                 prev_gatepass = prev.gatepass

#         # Preserve any existing gatepass on update (avoid re-allocating)
#         if prev_gatepass and not self.gatepass:
#             self.gatepass = prev_gatepass

#         # Allocate on first entry into a gatepass category
#         if not self.gatepass and current_cat in needs_gatepass and (prev_cat not in needs_gatepass):
#             self.gatepass = next_gatepass()

#         # If leaving the gatepass categories, clear it (keeps UI clean)
#         if self.gatepass and current_cat not in needs_gatepass and (prev_cat in needs_gatepass):
#             self.gatepass = None

#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.category} | {self.invoice_no or self.event_name or self.gatepass or '-'}"


# class SalesItem(models.Model):
#     outward = models.ForeignKey(Outward, related_name='sales_items', on_delete=models.CASCADE)
#     component = models.CharField(max_length=255)
#     serial_number = models.CharField(max_length=255, blank=True, null=True)
#     quantity = models.PositiveIntegerField(default=1)
#     remarks = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return f"[Sales] {self.component} x{self.quantity}"


# class EventItem(models.Model):
#     outward = models.ForeignKey(Outward, related_name='event_items', on_delete=models.CASCADE)
#     component = models.CharField(max_length=255)
#     serial_number = models.CharField(max_length=255, blank=True, null=True)
#     quantity = models.PositiveIntegerField(default=1)
#     remarks = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return f"[Event] {self.component} x{self.quantity}"

# # class ToolInventory(models.Model):
# #     component_id = models.CharField(max_length=100)
# #     tool_name = models.CharField(max_length=200)
# #     quantity = models.PositiveIntegerField(default=0)
# #     in_inventory = models.PositiveIntegerField(default=0)
# #     team = models.CharField(max_length=100, blank=True, null=True)
# #     remarks = models.TextField(blank=True, null=True)
# #     created_at = models.DateTimeField(auto_now_add=True)
# #     updated_at = models.DateTimeField(auto_now=True)

# #     def __str__(self):
# #         return f"{self.tool_name} ({self.component_id})"

# from decimal import Decimal
# from django.db import models


# class ToolInventory(models.Model):
#     tool_id = models.CharField(max_length=20, unique=True, blank=True)
#     tool_name = models.CharField(max_length=200)  #  mandatory
#     remarks = models.TextField(blank=True, null=True)  #  nullable

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def save(self, *args, **kwargs):
#         #  Auto-generate tool_id like T_00001
#         if not self.tool_id:
#             last = ToolInventory.objects.exclude(tool_id="").order_by("-id").first()
#             if last and last.tool_id and "_" in last.tool_id:
#                 last_num = int(last.tool_id.split("_")[1])
#                 self.tool_id = f"T_{last_num + 1:05d}"
#             else:
#                 self.tool_id = "T_00001"
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.tool_id} - {self.tool_name}"


# class ToolInventoryEntry(models.Model):
#     """
#     Each row = one entry inside a ToolInventory (same tool_id)
#     Example: 3 entries inside one tool_id (different vendor/price/gst/etc.)
#     """
#     tool = models.ForeignKey(
#         ToolInventory,
#         related_name="entries",
#         on_delete=models.CASCADE,
#     )

#     vendor = models.CharField(max_length=255, blank=True, null=True)
#     remarks = models.TextField(blank=True, null=True)

#     #  True means "in inventory"
#     status = models.BooleanField(default=True)

#     unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
#     gst = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"))
#     total_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def compute_total_price(self) -> Decimal:
#         base = self.unit_price or Decimal("0.00")
#         gst_pct = self.gst or Decimal("0.00")
#         return (base + (base * gst_pct / Decimal("100.00"))).quantize(Decimal("0.01"))

#     def save(self, *args, **kwargs):
#         #  Always auto-calc total_price from unit_price + gst
#         self.total_price = self.compute_total_price()
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.tool.tool_id} entry {self.id}"




from django.db import models
from django.db import transaction
from django.db import models, transaction
from django.db import models
from django.db import transaction
from django.db import models, transaction
from django.db import models, transaction
from django.db import models, transaction
# from new_app_structure.models import po_master
from django.db import models
from django.db.models.functions import Lower


class VendorList(models.Model):
    vendor_id = models.CharField(
        max_length=10, unique=True, editable=False, primary_key=True
    )
    vendor_name = models.CharField(max_length=255, unique=True)
    gstn = models.CharField(max_length=50, blank=True)
    active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.vendor_id:
            with transaction.atomic():
                last_vendor_id = VendorList.objects.select_for_update().aggregate(
                    models.Max("vendor_id")
                )["vendor_id__max"]

                if last_vendor_id:
                    last_num = int(last_vendor_id.split("_")[1])
                    new_num = last_num + 1
                    self.vendor_id = f"V_{new_num:05d}"  # Updated prefix to 'V'
                else:
                    self.vendor_id = "V_00001"  # Fixed the typo here
        super().save(*args, **kwargs)

    def __str__(self):
        return self.vendor_name


class VendorSubList(models.Model):
    CATEGORY_CHOICES = [
        ("Airframe", "Airframe"),
        ("Communication", "Communication"),
        ("Electricals", "Electricals"),
        ("Electronics", "Electronics"),
        ("Payload", "Payload"),
        ("Tools","Tools"),
    ]

    vendor = models.ForeignKey(
        VendorList, related_name="contacts", on_delete=models.CASCADE
    )
    point_of_contact = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=10, blank=True)
    location = models.CharField(max_length=955, blank=True)
    # category = models.CharField(max_length=50,choices=CATEGORY_CHOICES)
    default_poc = models.BooleanField()

    def __str__(self):
        return f"{self.point_of_contact} ({self.vendor.vendor_name})"


class VendorMaster(models.Model):

    component_type_list = [
       ("Accessories", "Accessories"),
        ("Actuator","Actuator"),
        # ("Ac Sheet-waterjet cutting", "Ac Sheet-waterjet cutting"),
        ("Adapter", "Adapter"),
        ("Antenna", "Antenna"),
        ("Balsa Sheet","Balsa Sheet"),
        ("Battery", "Battery"),
        # ("Battery Charger", "Battery Charger"),
        # ("Battery strap", "Battery strap"),
        ("BEC", "BEC"),
        # ("Brass Insert", "Brass Insert"),
        ("Breakout Module", "Breakout Module"),
        ("Buzzer", "Buzzer"),
        ("Cables", "Cables"),
        ("Camera", "Camera"),
        ("CAN Node", "CAN Node"),
        ("Capacitor", "Capacitor"),
        # ("Carbon Fibre", "Carbon Fibre"),
        ("Carrycase", "Carrycase"),
        ("CF Sheet", "CF Sheet"),
        ("CF Tube", "CF Tube"),
        # ("CF Sheet-waterjet cutting", "CF Sheet-waterjet cutting"),
        ("Charger", "Charger"),
        ("CNC cutting","CNC cutting"),
        ("Computational Board", "Computational Board"),
        ("Connectors", "Connectors"),
        ("Consumables", "Consumables"),
        # ("Controller", "Controller"),
        ("Converter", "Converter"),
        ("Crimp Cable", "Crimp Cable"),
        ("Dampner", "Dampner"),
        ("Diode", "Diode"),
        ("Drone Frame parts", "Drone Frame parts"),
        ("ESC", "ESC"),
        ("Evaluation Kit", "Evaluation Kit"),
        # ("Fasteners", "Fasteners"),
        ("Flight controller", "Flight controller"),
        ("Foam", "Foam"),
        ("FPV Goggles", "FPV Goggles"),
        # ("Frame parts & Tank", "Frame parts & Tank"),
        ("GF Sheet", "GF Sheet"),
        ("Gimbal", "Gimbal"),
        ("GPS", "GPS"),
        ("I2C Adapter", "I2C Adapter"),
        ("Interface Board", "Interface Board"),
        ("LCD", "LCD"),
        # ("Lipo Checker", "Lipo Checker"),
        # ("Locknut", "Locknut"),
        ("Micro Controller", "Micro Controller"),
        ("Mini Carrier Board", "Mini Carrier Board"),
        ("Mosfet", "Mosfet"),
        ("Motor", "Motor"),
        ("Motors ESC & Propeller Combo", "Motors ESC & Propeller Combo"),
        ("Mount", "Mount"),
        ("NPNT Module", "NPNT Module"),
        ("Oscilloscope", "Oscilloscope"),
        ("OSD", "OSD"),
        # ("Painting", "Painting"),
        ("Parachute", "Parachute"),
        ("PCB", "PCB"),
        ("PDB", "PDB"),
        ("Peripheral Control Module","Peripheral Control Module"),
        ("Propellers", "Propellers"),
        ("Quick Release", "Quick Release"),
        ("Receiver","Receiver"),
        ("Relay", "Relay"),
        ("Remote Controller", "Remote Controller"),
        ("Resistors", "Resistors"),
        ("RF Power Meter","RF Power Meter"),
        # ("Screws", "Screws"),
        ("SD Card", "SD Card"),
        ("Sensor", "Sensor"),
        # ("Servo", "Servo"),
        ("Servo Tester", "Servo Tester"),
        # ("Shock Absorber", "Shock Absorber"),
        ("Simulator Kit", "Simulator Kit"),
        # ("Sleeve", "Sleeve"),
        # ("Spacers","Spacers",),
        ("Spark Plug", "Spark Plug"),
        ("Sprayer System", "Sprayer System"),
        # ("Tank", "Tank"),
        ("Telemetry Module", "Telemetry Module"),
        ("Transmitter", "Transmitter"),
        ("Transreceiver", "Transreceiver"),
        ("UIN Plate", "UIN Plate"),
        # ("Velcro", "Velcro"),
        ("Voltmeter", "Voltmeter"),
        ("VRX", "VRX"),
        # ("Washers", "Washers"),
        ("Waterjet Cutting", "Waterjet Cutting"),
        ("Wifi Module","Wifi Module"),
        ("Winch", "Winch"),
        ("3D Printed Parts", "3D Printed Parts"),

    ]

    CATEGORY_CHOICES = [
        ("Airframe", "Airframe"),
        ("Communication", "Communication"),
        ("Electricals", "Electricals"),
        ("Electronics", "Electronics"),
        ("Payload", "Payload"),
        ("Accessories", "Accessories"),
        ("Tools","Tools"),
    ]

    vendor = models.ForeignKey(
        VendorList, on_delete=models.CASCADE, related_name="vendor_master"
    )
    component_id = models.ForeignKey("ComponentMaster", on_delete=models.CASCADE)

    product_description = models.TextField()
    unit_of_measurement = models.CharField(max_length=100)
    img = models.ImageField(upload_to="media/images/images/component_images/", blank=True, null=True)
    attachments = models.FileField(upload_to="attachments/", blank=True, null=True)
    product_id = models.CharField(max_length=100, primary_key=True, blank=True)
    # last_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True)
    category = models.CharField(max_length=255, choices=CATEGORY_CHOICES)
    component_type = models.CharField(max_length=50, choices=component_type_list)
    component_specification = models.TextField()
    # unit_of_measurement = models.CharField(max_length=100)
    # tax = models.IntegerField(blank=True)
    active = models.BooleanField(default=True)
    remarks = models.CharField(max_length=300,blank=True,null=True,default="")
    

    def save(self, *args, **kwargs):
        if not self.product_id:
            with transaction.atomic():
                last_product_id = VendorMaster.objects.select_for_update().aggregate(
                    models.Max("product_id")
                )["product_id__max"]

                if last_product_id:
                    last_num = int(last_product_id.split("P")[1])
                    new_num = last_num + 1
                    self.product_id = f"P{new_num:04d}"  # Updated prefix to 'P' P followed by 4 digits
                else:
                    self.product_id = "P0001"  # Fixed the typo here
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_id} - {self.product_description}"


class VendorProductImage(models.Model):
    component = models.ForeignKey(
        'ComponentMaster',  #  String reference avoids NameError
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='images/component_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.component.component_id}"



class price_table(models.Model):
    product = models.ForeignKey(VendorMaster, on_delete=models.CASCADE)
    current_time = models.DateTimeField()
    tax = models.IntegerField()
    price = models.DecimalField(max_digits=20, decimal_places=10)  
    delivery_days = models.PositiveIntegerField(null=True, blank=True)
 

class ComponentMaster(models.Model):
    component_id = models.CharField(max_length=10, primary_key=True, blank=True)
    category = models.CharField(max_length=255, blank=True)
    component_type = models.CharField(max_length=255, blank=True)
    component_specification = models.TextField(blank=True)
    unit_of_measurement = models.CharField(max_length=100, blank=True)
    # product_id = models.ForeignKey(VendorMaster, on_delete=models.CASCADE)
    # vendor_id = models.ForeignKey(VendorList, on_delete=models.CASCADE)
    
    hsn_numbers = models.JSONField(default=list, blank=True)    
    sku_numbers = models.JSONField(default=list, blank=True)    
    part_numbers = models.JSONField(default=list, blank=True)   
    
    
    ordering_id = models.IntegerField(
        unique=True, blank=True, null=True
    )  # New unique integer field for ordering6
    tally_reference = models.CharField(max_length=255,blank=True)

    class Meta:
        ordering = ["ordering_id"]

    def save(self, *args, **kwargs): 
        if not self.component_id:
            with transaction.atomic():
                last_component_id = (
                    ComponentMaster.objects.select_for_update().aggregate(
                        models.Max("component_id")
                    )["component_id__max"]
                )

                if last_component_id:
                    last_num = int(last_component_id.split("_")[1])
                    new_num = last_num + 1
                    self.component_id = f"C_{new_num:05d}"
                else:
                    self.component_id = "C_00001"
        super().save(*args, **kwargs)

    def __str__(self):
        # return self.component_id
        return f"{self.component_id} - {self.component_type} - {self.component_specification}"


class RequestComponent(models.Model):
    component_type_list = [
        ("Accessories", "Accessories"),
        ("Actuator","Actuator"),
        # ("Ac Sheet-waterjet cutting", "Ac Sheet-waterjet cutting"),
        ("Adapter", "Adapter"),
        ("Antenna", "Antenna"),
        ("Balsa Sheet","Balsa Sheet"),
        ("Battery", "Battery"),
        # ("Battery Charger", "Battery Charger"),
        # ("Battery strap", "Battery strap"),
        ("BEC", "BEC"),
        # ("Brass Insert", "Brass Insert"),
        ("Breakout Module", "Breakout Module"),
        ("Buzzer", "Buzzer"),
        ("Cables", "Cables"),
        ("Camera", "Camera"),
        ("CAN Node", "CAN Node"),
        ("Capacitor", "Capacitor"),
        # ("Carbon Fibre", "Carbon Fibre"),
        ("Carrycase", "Carrycase"),
        ("CF Sheet", "CF Sheet"),
        ("CF Tube", "CF Tube"),
        # ("CF Sheet-waterjet cutting", "CF Sheet-waterjet cutting"),
        ("Charger", "Charger"),
        ("CNC cutting","CNC cutting"),
        ("Computational Board", "Computational Board"),
        ("Connectors", "Connectors"),
        ("Consumables", "Consumables"),
        # ("Controller", "Controller"),
        ("Converter", "Converter"),
        ("Crimp Cable", "Crimp Cable"),
        ("Dampner", "Dampner"),
        ("Diode", "Diode"),
        ("Drone Frame parts", "Drone Frame parts"),
        ("ESC", "ESC"),
        ("Evaluation Kit", "Evaluation Kit"),
        # ("Fasteners", "Fasteners"),
        ("Flight controller", "Flight controller"),
        ("Foam", "Foam"),
        ("FPV Goggles", "FPV Goggles"),
        # ("Frame parts & Tank", "Frame parts & Tank"),
        ("GF Sheet", "GF Sheet"),
        ("Gimbal", "Gimbal"),
        ("GPS", "GPS"),
        ("I2C Adapter", "I2C Adapter"),
        ("Interface Board", "Interface Board"),
        ("LCD", "LCD"),
        # ("Lipo Checker", "Lipo Checker"),
        # ("Locknut", "Locknut"),
        ("Micro Controller", "Micro Controller"),
        ("Mini Carrier Board", "Mini Carrier Board"),
        ("Mosfet", "Mosfet"),
        ("Motor", "Motor"),
        ("Motors ESC & Propeller Combo", "Motors ESC & Propeller Combo"),
        ("Mount", "Mount"),
        ("NPNT Module", "NPNT Module"),
        ("Oscilloscope", "Oscilloscope"),
        ("OSD", "OSD"),
        # ("Painting", "Painting"),
        ("Parachute", "Parachute"),
        ("PCB", "PCB"),
        ("PDB", "PDB"),
        ("Peripheral Control Module","Peripheral Control Module"),
        ("Propellers", "Propellers"),
        ("Quick Release", "Quick Release"),
        ("Receiver","Receiver"),
        ("Relay", "Relay"),
        ("Remote Controller", "Remote Controller"),
        ("Resistors", "Resistors"),
        ("RF Power Meter","RF Power Meter"),
        # ("Screws", "Screws"),
        ("SD Card", "SD Card"),
        ("Sensor", "Sensor"),
        # ("Servo", "Servo"),
        ("Servo Tester", "Servo Tester"),
        # ("Shock Absorber", "Shock Absorber"),
        ("Simulator Kit", "Simulator Kit"),
        # ("Sleeve", "Sleeve"),
        # ("Spacers","Spacers",),
        ("Spark Plug", "Spark Plug"),
        ("Sprayer System", "Sprayer System"),
        # ("Tank", "Tank"),
        ("Telemetry Module", "Telemetry Module"),
        ("Transmitter", "Transmitter"),
        ("Transreceiver", "Transreceiver"),
        ("UIN Plate", "UIN Plate"),
        # ("Velcro", "Velcro"),
        ("Voltmeter", "Voltmeter"),
        ("VRX", "VRX"),
        # ("Washers", "Washers"),
        ("Waterjet Cutting", "Waterjet Cutting"),
        ("Wifi Module","Wifi Module"),
        ("Winch", "Winch"),
        ("3D Printed Parts", "3D Printed Parts"),

    ]


    CATEGORY_CHOICES = [
        ("Accessories", "Accessories"),
        ("Airframe", "Airframe"),
        ("Communication", "Communication"),
        ("Electricals", "Electricals"),
        ("Electronics", "Electronics"),
        ("Payload", "Payload"),
        ("Tools","Tools"),
       
    ]

    
    bom = models.CharField(max_length=50, null=True, blank=True)  # ✅ ADD THIS
    name = models.CharField(max_length=255)
    request_date = models.DateField(auto_now_add=True)
    category = models.CharField(max_length=255, choices=CATEGORY_CHOICES)
    component_type = models.CharField(max_length=255, choices=component_type_list)
    component_specification = models.TextField()
    uom = models.CharField(max_length=100)
    product_link = models.URLField(blank=True, null=True,max_length=7000)
    status = models.CharField(
        max_length=50,
        choices=[("Pending", "Pending"), ("Rejected", "Rejected"), ("Added", "Added")],
        default="Pending"
    )
    # reason = models.TextField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    component_id = models.CharField(max_length=50, blank=True, null=True)
    vendor_added = models.BooleanField(default=False)
    quantity = models.IntegerField(null=True, blank=True)
    hsn_number = models.CharField(max_length=50, blank=True, null=True)
    sku_number = models.CharField(max_length=50, blank=True, null=True)
    part_number = models.CharField(max_length=50, blank=True, null=True)


    def __str__(self):
        return f"{self.name} - {self.component_type}"



class meta_tags(models.Model):
    tags = models.CharField(max_length=100)
    component_id = models.ForeignKey(ComponentMaster, on_delete=models.CASCADE)


class create_tags(models.Model):
    tags = models.CharField(max_length=100)


class tags_table(models.Model):
    tags_choices = models.ForeignKey(create_tags, on_delete=models.CASCADE)
    component_id = models.ForeignKey(ComponentMaster, on_delete=models.CASCADE)
    tags = models.CharField(max_length=100)

from django.db import models


class Inventory(models.Model):

    STATUS_CHOICES = [
        ("Available", "Available"),
        ("Reserved", "Reserved"),
        ("In_drone", "In_drone"),
        ("Damaged", "Damaged"),
        ("Repair", "Repair"),
    ]

    component_id = models.CharField(max_length=50)

    serial_number = models.CharField(
        primary_key=True,
        max_length=50,
        unique=True,
        blank=True
    )

    component_type = models.CharField(max_length=100)
    vendor_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    specification = models.CharField(max_length=300)
    UOM = models.CharField(max_length=20)

    # ✅ better for sorting than DateField
    create_date = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Available"
    )

    project_name = models.CharField(max_length=200, blank=True)

    price = models.DecimalField(max_digits=20, decimal_places=10)
    gst = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    total_price = models.DecimalField(max_digits=20, decimal_places=10)

    sku_number_inventory = models.CharField(max_length=50, blank=True)
    Request_id_assign = models.CharField(max_length=50, blank=True)

    remarks = models.CharField(max_length=500, blank=True)

    is_taken = models.BooleanField(default=False)
    taken_by = models.CharField(max_length=255, blank=True, null=True)
    taken_date = models.DateField(blank=True, null=True)
    return_date = models.DateField(blank=True, null=True)

    # ✅ FIX: auto-sort all queries by creation time
    class Meta:
        ordering = ['create_date']

    def save(self, *args, **kwargs):
        from .models import Reserved

        super().save(*args, **kwargs)

        if self.status == "Reserved":
            Reserved.objects.get_or_create(serial_number=self)
        else:
            Reserved.objects.filter(serial_number=self).delete()

    def __str__(self):
        return f"{self.serial_number} - {self.status}"


class Reserved(models.Model):
    serial_number = models.ForeignKey(Inventory, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default="Reserved")
    Reserved_date=models.DateField(auto_now_add=True)

    def save(self, *args, **kwargs):
        from .models import Inventory

        super().save(*args, **kwargs)
        if self.status == "Reserved":
            Inventory.objects.filter(serial_number=self.serial_number).update(
                status="Reserved"
                
            )
        else:
            Inventory.objects.filter(serial_number=self.serial_number).update(
                status="Available"
            )


from django.db import models, transaction


class create_MRF(models.Model):

    
    MRF_id = models.CharField(max_length=100, primary_key=True, blank=True)
    create_date = models.DateField(auto_now_add=True)
    name = models.CharField(max_length=100)
    date = models.DateField()
    Request_id_assign = models.CharField(max_length=50, blank=True)
    approval = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        from .models import (
            Inventory,
        )  # Import inside function to avoid circular imports

        if not self.MRF_id:
            with transaction.atomic():
                last_MRF = (
                    create_MRF.objects.select_for_update().order_by("-MRF_id").first()
                )

                if last_MRF and last_MRF.MRF_id.startswith("MRF_"):
                    try:
                        last_num = int(last_MRF.MRF_id.split("_")[1])
                        new_num = last_num + 1
                        self.MRF_id = f"MRF_{new_num:05d}"
                    except (ValueError, IndexError):
                        self.MRF_id = "MRF_00001"
                else:
                    self.MRF_id = "MRF_00001"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"MRF_id: {self.MRF_id}"


class MRFList(models.Model):
    """
    Stores MRF details, linked to CreateMRF.
    """

    MRF_id = models.ForeignKey(
        create_MRF, on_delete=models.CASCADE, related_name="mrf_items"
    )
    serial_number = models.ForeignKey("Inventory", on_delete=models.CASCADE)
    component_type = models.CharField(max_length=100)
    component_specification = models.TextField()
    unit_of_measurement = models.CharField(max_length=100)
    category = models.CharField(max_length=255)
    status = models.CharField(max_length=100, blank=True)
    returns = models.CharField(max_length=100, blank=True)
    remarks = models.CharField(max_length=100, blank=True)
    reported_by = models.CharField(max_length=100, blank=True)
    action = models.BooleanField(default=False)
    quantity = models.IntegerField(default=1, blank=True, null=True)

    def __str__(self):
        return f"MRF ID: {self.MRF_id.MRF_id} | Serial: {self.serial_number}"

class MRFsubList(models.Model):
    """
    Stores MRF details, linked to CreateMRF.
    """

    MRF_id = models.ForeignKey(
        create_MRF, on_delete=models.CASCADE, related_name="mrf_sub_items"
    )
    quantity = models.IntegerField()
    component_type = models.CharField(max_length=100)
    component_specification = models.TextField()
    unit_of_measurement = models.CharField(max_length=100)
    category = models.CharField(max_length=255)
    status = models.CharField(max_length=100, blank=True)
    component_id = models.CharField(max_length=50)
   

    def __str__(self):
        return f"MRF ID: {self.MRF_id.MRF_id} | Serial: {self.component_id}"



class Reserved_list(models.Model):
    MRF_id = models.ForeignKey(create_MRF, on_delete=models.CASCADE)


class BOMList(models.Model):
    bom_id = models.CharField(max_length=100, primary_key=True, unique=True, blank=True)
    bom_name = models.CharField(max_length=255)
    number_of_components = models.IntegerField(blank=True)
    created_by = models.CharField(max_length=255)
    created_date = models.DateField(auto_now_add=True)
    last_modified_by = models.CharField(max_length=255)
    last_modified_date = models.DateField(auto_now=True)
    wbom = models.BooleanField(default=True)

    """
    Overrides the save method to generate a unique bom_id if it doesn't exist.

    The bom_id is generated by incrementing the last bom_id in the database.
    If no bom_id exists, it is initialized to 'B_00001'.
    """

    def save(self, *args, **kwargs):
        if not self.bom_id:  # Generate bom_id only if not already set
            with transaction.atomic():
                # Lock the BOMList table to avoid race conditions
                last_bom_id = BOMList.objects.select_for_update().aggregate(
                    models.Max("bom_id")  # Fetch the max bom_id
                )["bom_id__max"]

                if last_bom_id:
                    # Extract the numeric part and increment
                    last_num = int(last_bom_id.split("_")[1])
                    new_num = last_num + 1
                    self.bom_id = f"B_{new_num:05d}"  # Generate the new bom_id
                else:
                    self.bom_id = "B_00001"  # Default starting bom_id

        # Call the parent save method
        super().save(*args, **kwargs)


class BOMMaster(models.Model):
    bom = models.ForeignKey(
        BOMList, on_delete=models.CASCADE, related_name="bom_master"
    )
    component = models.ForeignKey(ComponentMaster, on_delete=models.CASCADE)

    quantity = models.IntegerField(null=True, blank=True)

    vendor = models.ForeignKey(
        VendorList, on_delete=models.CASCADE, null=True, blank=True
    )

    # ✅ allow null (already correct)
    price = models.DecimalField(
        max_digits=20, decimal_places=10, null=True, blank=True
    )
    tax = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    date = models.DateField(null=True, blank=True)

    name = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        # ✅ handle vendor safely (can be null)
        vendor_name = self.vendor.vendor_name if self.vendor else "NoVendor"

        # ✅ avoid "None" in name
        if not self.name:
            self.name = f"{self.bom}-{self.component}-{vendor_name}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.bom} - {self.component}"

class project_details(models.Model):

    project_name = models.CharField(max_length=100)
    project_id = models.CharField(max_length=10, primary_key=True, blank=True)
    description = models.TextField()
    start_date = models.DateField()
    RequestList_id = models.CharField(max_length=50, blank=True)
    project_type = models.CharField(max_length=100, blank=True)

    def save(self, *args, **kwargs):
        if not self.project_id:
            with transaction.atomic():
                # Get the last project ID
                last_project_id = project_details.objects.select_for_update().aggregate(
                    models.Max("project_id")
                )["project_id__max"]

                # Check if last_project_id exists and is valid
                if last_project_id:
                    try:
                        last_num = int(last_project_id.split("_")[1])
                        new_num = last_num + 1
                        self.project_id = f"PRJ_{new_num:05d}"
                    except (IndexError, ValueError):
                        # Handle case where last_project_id is invalid
                        self.project_id = "PRJ_00001"
                else:
                    # Default for first project ID
                    self.project_id = "PRJ_00001"

        # Save the object
        super().save(*args, **kwargs)


class RequestList(models.Model):
    request_id = models.CharField(
        max_length=10, unique=True, editable=False, primary_key=True
    )
    requester_name = models.CharField(max_length=255)
    description = models.CharField(max_length=200, blank=True, null=True)
    date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=50)
    last_modified_by = models.CharField(max_length=255)
    # bom = models.ForeignKey(BOMMaster, on_delete=models.CASCADE)
    bom = models.ForeignKey(BOMList, on_delete=models.CASCADE)
    bom_name = models.CharField(max_length=255, blank=True)

    def save(self, *args, **kwargs):
        if not self.request_id:
            with transaction.atomic():
                last_request_id = RequestList.objects.select_for_update().aggregate(
                    models.Max("request_id")
                )["request_id__max"]

                if last_request_id:
                    last_num = int(last_request_id.split("_")[1])
                    new_num = last_num + 1
                    self.request_id = f"R_{new_num:05d}"
                else:
                    self.request_id = "R_00001"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.requester_name


class RequestMaster(models.Model):
    bom = models.ForeignKey(
        BOMList,   # same model used in BOMMaster
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="requests"
    )

    request = models.ForeignKey(RequestList, on_delete=models.CASCADE)
    component = models.ForeignKey(ComponentMaster, on_delete=models.CASCADE)
    vendor = models.ForeignKey(VendorList, on_delete=models.CASCADE)
    # bom = models.ForeignKey(BOMMaster, on_delete=models.CASCADE)
    status = models.CharField(max_length=100)
    qty = models.IntegerField()
    assign = models.BooleanField()
    cart_assign = models.BooleanField(default=False)
    approve = models.BooleanField(default=False)

    # next rime push check this field naveen working on

    project_id = models.ForeignKey(project_details, on_delete=models.CASCADE)

    def __str__(self):
        return f"Request {self.request} for {self.component}"

    @property
    def po_statuses(self):
        # Fetch related PO statuses
        related_po_links = RequestToPO.objects.filter(
            request=self.request
        ).select_related("po")
        return [
            {"po_id": po.po.id, "po_status": po.po.status} for po in related_po_links
        ]


from django.db import models, transaction


# Cart Model
class cart(models.Model):
    component_id = models.CharField(max_length=10)
    category = models.CharField(max_length=255)
    component_type = models.CharField(max_length=255)
    component_specification = models.TextField()
    unit_of_measurement = models.CharField(max_length=100)
    vendor_name = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField()  # Ensures non-negative values
    vendor_id = models.CharField(max_length=10)
    unit_price = models.DecimalField(max_digits=20, decimal_places=10)
    GST = models.DecimalField(max_digits=5, decimal_places=2)
    total_cost = models.DecimalField(max_digits=20, decimal_places=10)
    order_placed = models.BooleanField(default=False)
    date = models.DateField(auto_now_add=True, blank=True)
    gstn = models.CharField(max_length=50, blank=True)
    request_list_id =models.CharField(max_length=10)

    # request _status

    request_id = models.ForeignKey(RequestMaster, on_delete=models.CASCADE)

    def __str__(self):
        return f"Vendor: {self.vendor_name}, Component: {self.component_id}"


# Purchase Order List Model
class po_list(models.Model):
    id = models.CharField(max_length=50, primary_key=True, blank=True)
    # status = models.CharField(max_length=50)
    date = models.DateField(auto_now_add=True, blank=True)
    cart_id = models.ForeignKey(cart, on_delete=models.CASCADE)
    # vendor_name=models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        if not self.id:
            with transaction.atomic():
                last_po = po_list.objects.select_for_update().aggregate(
                    models.Max("id")
                )["id__max"]

                if last_po:
                    last_num = int(last_po.split("_")[1])
                    new_num = last_num + 1
                    self.id = f"PO_{new_num:05d}"
                else:
                    self.id = "PO_00001"
        super().save(*args, **kwargs)

    def __str__(self):
        latest_master = self.po_master_set.last()
        status = latest_master.status if latest_master else "N/A"
        return f"PO ID: {self.id}, Status: {status}"



class RequestToPO(models.Model):
    request = models.ForeignKey("RequestList", on_delete=models.CASCADE)
    po = models.ForeignKey("po_list", on_delete=models.CASCADE)

    def __str__(self):
        return f"Request ID: {self.request.request_id} <-> PO ID: {self.po.id}"


class qc_component_type(models.Model):
    component_type = models.CharField(max_length=100, unique=True)  # simple uniqueness

    class Meta:
        constraints = [
            # Optional: case-insensitive uniqueness (Django 4.2+; may require proper DB support)
            models.UniqueConstraint(
                Lower('component_type'),
                name='uq_qc_component_type_ci'
            )
        ]


class qc_question(models.Model):

    component_type = models.ForeignKey(qc_component_type, on_delete=models.CASCADE)
    question = models.CharField(max_length=100)


class qc_answer(models.Model):

    qc_question = models.ForeignKey(qc_question, on_delete=models.CASCADE)
    yes = models.BooleanField()
    no = models.BooleanField()
    Inward_id = models.CharField(max_length=50)
    gray_status = models.BooleanField(default=True)


class qc_return_answer(models.Model):

    qc_question = models.ForeignKey(qc_question, on_delete=models.CASCADE)
    yes = models.BooleanField()
    no = models.BooleanField()
    serial_number = models.CharField(max_length=50)
    gray_status = models.BooleanField(default=True)


# Purchase Order Master Model
class po_master(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Ordered', 'Ordered'),
        ('Cancelled', 'Cancelled'),
        ('Shipped', 'Shipped'), 
        ('Received', 'Received'),
    ]
      
    PO_id = models.ForeignKey(po_list, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    cart_id = models.ForeignKey(cart, on_delete=models.CASCADE)
    inward_status = models.BooleanField(default=True)
    edited_quantity =  models.PositiveIntegerField(default=0)
    edited_total_cost = models.DecimalField(max_digits=20, decimal_places=10, default=0) 
    # gstn=models.CharField(max_length=50,blank=True)

    def __str__(self):
        return f"PO: {self.PO_id}, Status: {self.status}"


class PODelivery(models.Model):
    po_master = models.ForeignKey(po_master, on_delete=models.CASCADE)
    component_id = models.CharField(max_length=50)  # New field
    specification = models.CharField(max_length=200)  # New field

    quantity = models.PositiveIntegerField()  # Ordered Qty
    order_placed_date_time = models.DateTimeField(blank=True, null=True)  # Ordered Date

    shipped_quantity = models.PositiveIntegerField(default=0)
    shipped_date = models.DateTimeField(blank=True, null=True)

    received_quantity = models.PositiveIntegerField(default=0)
    received_date = models.DateTimeField(blank=True, null=True)

    inward = models.BooleanField(default=False)  # Inward Status
    pending_quantity = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.po_master.cart_id.component_id or 0} - {self.quantity} units"
    
# Order Status Model
class order_status(models.Model):
    po_master_id = models.ForeignKey(po_master, on_delete=models.CASCADE)
    order_placed_status = models.CharField(max_length=100)
    order_placed_date_time = models.DateTimeField(blank=True, null=True)
    customer_status = models.CharField(max_length=100, blank=True)
    customer_date_time = models.DateTimeField(blank=True, null=True)
    received_status = models.CharField(max_length=100, blank=True)
    received_date = models.DateTimeField(blank=True, null=True)
    # component_id = models.CharField(max_length=50)

    def __str__(self):
        return f"Order Placed: {self.order_placed_status}, Received: {self.received_status}"


import re
from django.db import models, transaction

try:
    # if Inventory model lives alongside Inward
    from new_app_structure.models import Inventory  # <-- change if needed
except Exception:
    Inventory = None
    # Or, if it lives under Inventory_api:
    # from new_app_structure.Inventory_api.models import Inventory  # uncomment + delete the try/except

class Inward(models.Model):
    inward_id = models.CharField(max_length=50, primary_key=True, blank=True)
    po_master_id = models.ForeignKey(po_master, on_delete=models.CASCADE)
    serial_number = models.CharField(max_length=50, blank=True)
    quality_check = models.CharField(max_length=20)
    date = models.DateTimeField(auto_now_add=True)
    component_id = models.CharField(max_length=50)
    mode_to_inventory = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=20, decimal_places=10)
    sku_number = models.CharField(max_length=50, blank=True)

    invoice_number = models.CharField(max_length=100, blank=True, null=True)
    invoice_date = models.DateField(blank=True, null=True)
    gst = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    # ---------- helpers ----------
    @staticmethod
    def _extract_s_num(serial: str) -> int:
        """
        Extracts the trailing S-number from a serial like 'C_00001S00037' -> 37.
        Returns 0 if it cannot parse.
        """
        if not serial:
            return 0
        m = re.search(r"S(\d+)$", serial)
        return int(m.group(1)) if m else 0
 
    def _next_serial_for_component(self) -> str:
        """
        Compute next serial by scanning BOTH Inward and Inventory
        for the same component_id and taking the max S-number.
        """
        max_num = 0

        # Lock Inward rows for this component so concurrent QC-pass
        # transactions don't pick the same number.
        inward_serials = (
            Inward.objects.select_for_update()
            .filter(component_id=self.component_id)
            .values_list("serial_number", flat=True)
        )
        for s in inward_serials:
            max_num = max(max_num, self._extract_s_num(s))

        # Also scan Inventory (cannot row-lock here easily, but reading max is fine)
        if Inventory is not None:
            inv_serials = (
                Inventory.objects.filter(component_id=self.component_id)
                .values_list("serial_number", flat=True)
            )
            for s in inv_serials:
                max_num = max(max_num, self._extract_s_num(s))

        # build the new serial: C_00001S00042, etc.
        comp_num = int(self.component_id.split("_")[-1])
        return f"C_{comp_num:05d}S{max_num + 1:05d}"

    def save(self, *args, **kwargs):
        # Generate inward_id if not already set
        if not self.inward_id:
            with transaction.atomic():
                last_inward = (
                    Inward.objects.select_for_update()
                    .aggregate(models.Max("inward_id"))
                    ["inward_id__max"]
                )
                if last_inward:
                    last_num = int(last_inward.split("_")[1])
                    new_num = last_num + 1
                    self.inward_id = f"IW_{new_num:05d}"
                else:
                    self.inward_id = "IW_00001"

        # Generate serial_number only when QC passed and component set
        if getattr(self, "quality_check", "") and self.component_id:
            if self.quality_check.lower() == "pass" and not self.serial_number:
                with transaction.atomic():
                    # compute next serial across BOTH tables
                    self.serial_number = self._next_serial_for_component()

        super().save(*args, **kwargs)


class email(models.Model):

    file = models.FileField(upload_to="email_attachments/")


from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("Sub-Admin", "Sub-Admin"),
        ("procurement_manager", "Procurement Manager"),
        ("vendor_manager", "Vendor Manager"),
        ("inventory_manager", "Inventory Manager"),
        ("user", "User"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")

    groups = models.ManyToManyField(
        Group,
        related_name="customuser_set",
        blank=True,
        help_text=(
            "The groups this user belongs to. A user will get all permissions "
            "granted to each of their groups."
        ),
        verbose_name="groups",
    ) 
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_permissions",
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

# class meta_tags(models.Model):
#     tags=models.CharField(max_length=100)
#     component_id=models.ForeignKey(ComponentMaster,on_delete=models.CASCADE)


class register(models.Model):
    email = models.CharField(max_length=200)
    password = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    status = models.BooleanField(default=True)
    reset_token = models.CharField(max_length=128, blank=True, null=True)  # for reset link
    token_expiry = models.DateTimeField(blank=True, null=True)


    # def save(self, *args, **kwargs):
    #     # Hash the password if it's not already hashed
    #     if self.password and not self.password.startswith('pbkdf2_'):
    #         self.password = make_password(self.password)
    #     super().save(*args, **kwargs)
class inventory_status(models.Model):
    status=models.CharField(max_length=100)
    current_date_time=models.DateTimeField(auto_now_add=True)
    serial_number=models.ForeignKey(Inventory,on_delete=models.CASCADE)



class DamagedInventory(models.Model):
    serial_number = models.OneToOneField(
        Inventory,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="damage_report",
        help_text="Serial number of the damaged item",
    )
    component_category = models.CharField(
        max_length=255, help_text="Category of the component"
    )
    component_type = models.CharField(max_length=255, help_text="Type of the component")  
    component_specification = models.TextField(
        help_text="Specification details of the component"
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ("damaged", "Damaged"),
            ("repairable", "Can be Repaired"),
            ("returned", "Returned"),
        ], 
        # default="damaged",
        help_text="Current status of the item",
    )
    remarks = models.TextField(
        blank=True, null=True, help_text="Additional remarks about the damage"
    )
    reported_by = models.CharField(
        max_length=255, help_text="Name of the person who reported the damage"
    )
    reported_date = models.DateTimeField(
        auto_now_add=True, help_text="Date and time when the damage was reported"
    )
    updated_date = models.DateTimeField(
        auto_now=True, help_text="Last updated date and time"
    )

    def __str__(self):
        return f"{self.serial_number.serial_number} - {self.status}"
    
import re
from django.db import transaction
from django.db.models import F

# --- Gatepass counter model stays the same ---
class GatepassCounter(models.Model):
    key = models.CharField(max_length=32, primary_key=True, default="gatepass")
    last = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.key}:{self.last}"

# --- helpers for syncing with DB ---
GP_RE = re.compile(r"GP[-_]?(\d+)$")

def _max_gatepass_in_db() -> int:
    """
    Return the highest numeric GP value currently present in Outward.gatepass.
    If no Outward rows have a gatepass, returns 0.
    """
    max_num = 0
    # Import locally to avoid circular import issues if needed
    from new_app_structure.models import Outward

    qs = (
        Outward.objects
        .exclude(gatepass__isnull=True)
        .exclude(gatepass="")
        .values_list("gatepass", flat=True)
    )
    for gp in qs:
        m = GP_RE.search(gp or "")
        if m:
            n = int(m.group(1))
            if n > max_num:
                max_num = n 
    return max_num

def next_gatepass() -> str:
    """
    Returns the next gatepass like GP-00001 in a concurrency-safe way.
    It first syncs the counter to what's actually in the DB so that if
    you delete all Outward rows, the next value becomes GP-00001 again.
    """
    with transaction.atomic():
        counter, _ = GatepassCounter.objects.select_for_update().get_or_create(key="gatepass")

        db_max = _max_gatepass_in_db()   # e.g. 0 if table empty
        if counter.last != db_max:
            counter.last = db_max
            counter.save(update_fields=["last"])

        counter.last = F("last") + 1
        counter.save(update_fields=["last"])
        counter.refresh_from_db(fields=["last"])
        return f"GP-{counter.last:05d}"
class Outward(models.Model):
    OUTWARD_TYPE_CHOICES = [
        ("Project Use", "Project Use"),
        ("Client Delivery", "Client Delivery"),
        ("Sample", "Sample"),
        ("Return", "Return"),
        ("Non-Return", "Non-Return"),
        ("Others", "Others"),
    ]
    OUTWARD_CATEGORY_CHOICES = [
        ("Defects", "Defects"),
        ("Sales", "Sales"),
        ("Manufacture", "Manufacture"),
        ("Event", "Event"),
    ]

    category = models.CharField(max_length=50, choices=OUTWARD_CATEGORY_CHOICES, default="Defects")
    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)

    invoice_no = models.CharField(max_length=100, blank=True, null=True)
    vendor = models.TextField(blank=True, null=True)
    specification = models.TextField(blank=True, null=True)
    quantity = models.PositiveIntegerField(blank=True, null=True)
    component_id = models.CharField(max_length=50, blank=True, null=True)
    project = models.ForeignKey('project_details', on_delete=models.SET_NULL, null=True, blank=True)
    type_of_outward = models.CharField(max_length=50, choices=OUTWARD_TYPE_CHOICES)
    remarks = models.TextField(blank=True, null=True)

    # optional csv fields
    serial_numbers = models.TextField(blank=True, null=True)
    attachments = models.TextField(blank=True, null=True)

    # fields used by Event/Manufacture only (gatepass unique)
    product_name = models.CharField(max_length=255, blank=True, null=True)
    client = models.CharField(max_length=255, blank=True, null=True)
    list_of_deliverables = models.TextField(blank=True, null=True)

    gatepass = models.CharField(max_length=100, blank=True, null=True, unique=True)
    event_name = models.CharField(max_length=255, blank=True, null=True)
    num_components = models.PositiveIntegerField(blank=True, null=True)
    return_date = models.DateField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Gatepass should exist only for Manufacture & Event
        needs_gatepass = {"Manufacture", "Event"}
        norm = lambda s: (s or "").strip().title()
        current_cat = norm(self.category)

        prev_cat = None
        prev_gatepass = None
        if self.pk:
            prev = Outward.objects.filter(pk=self.pk).only("category", "gatepass").first()
            if prev:
                prev_cat = norm(prev.category)
                prev_gatepass = prev.gatepass

        # Preserve any existing gatepass on update (avoid re-allocating)
        if prev_gatepass and not self.gatepass:
            self.gatepass = prev_gatepass

        # Allocate on first entry into a gatepass category
        if not self.gatepass and current_cat in needs_gatepass and (prev_cat not in needs_gatepass):
            self.gatepass = next_gatepass()

        # If leaving the gatepass categories, clear it (keeps UI clean)
        if self.gatepass and current_cat not in needs_gatepass and (prev_cat in needs_gatepass):
            self.gatepass = None

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category} | {self.invoice_no or self.event_name or self.gatepass or '-'}"


class SalesItem(models.Model):
    outward = models.ForeignKey(Outward, related_name='sales_items', on_delete=models.CASCADE)
    component = models.CharField(max_length=255)
    serial_number = models.CharField(max_length=255, blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"[Sales] {self.component} x{self.quantity}"


class EventItem(models.Model):
    outward = models.ForeignKey(Outward, related_name='event_items', on_delete=models.CASCADE)
    component = models.CharField(max_length=255)
    serial_number = models.CharField(max_length=255, blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"[Event] {self.component} x{self.quantity}"

# class ToolInventory(models.Model):
#     component_id = models.CharField(max_length=100)
#     tool_name = models.CharField(max_length=200)
#     quantity = models.PositiveIntegerField(default=0)
#     in_inventory = models.PositiveIntegerField(default=0)
#     team = models.CharField(max_length=100, blank=True, null=True)
#     remarks = models.TextField(blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.tool_name} ({self.component_id})"

from decimal import Decimal
from django.db import models


class ToolInventory(models.Model):
    tool_id = models.CharField(max_length=20, unique=True, blank=True)
    tool_name = models.CharField(max_length=200)  #  mandatory
    remarks = models.TextField(blank=True, null=True)  #  nullable

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        #  Auto-generate tool_id like T_00001
        if not self.tool_id:
            last = ToolInventory.objects.exclude(tool_id="").order_by("-id").first()
            if last and last.tool_id and "_" in last.tool_id:
                last_num = int(last.tool_id.split("_")[1])
                self.tool_id = f"T_{last_num + 1:05d}"
            else:
                self.tool_id = "T_00001"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.tool_id} - {self.tool_name}"


class ToolInventoryEntry(models.Model):
    """
    Each row = one entry inside a ToolInventory (same tool_id)
    Example: 3 entries inside one tool_id (different vendor/price/gst/etc.)
    """
    tool = models.ForeignKey(
        ToolInventory,
        related_name="entries",
        on_delete=models.CASCADE,
    )

    vendor = models.CharField(max_length=255, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    #  True means "in inventory"
    status = models.BooleanField(default=True)

    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    gst = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"))
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def compute_total_price(self) -> Decimal:
        base = self.unit_price or Decimal("0.00")
        gst_pct = self.gst or Decimal("0.00")
        return (base + (base * gst_pct / Decimal("100.00"))).quantize(Decimal("0.01"))

    def save(self, *args, **kwargs):
        #  Always auto-calc total_price from unit_price + gst
        self.total_price = self.compute_total_price()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.tool.tool_id} entry {self.id}"
