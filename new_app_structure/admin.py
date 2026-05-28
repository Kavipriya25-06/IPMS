from django.contrib import admin

# Register your models here.
from .models import  ComponentMaster, Inward,VendorList,Inventory,BOMList,VendorMaster,BOMMaster,RequestList,RequestMaster, VendorSubList, cart, create_tags, meta_tags, order_status,po_list, po_master, price_table, project_details, qc_answer, qc_component_type, qc_question, tags_table, PODelivery,Outward

from .models import CustomUser,register, DamagedInventory,create_MRF

from .models import Reserved


admin.site.register(create_MRF)
admin.site.register(ComponentMaster)
admin.site.register(VendorMaster)
admin.site.register(Inventory)
admin.site.register(BOMMaster)
admin.site.register(VendorList)
admin.site.register(BOMList)
admin.site.register(RequestList)
admin.site.register(RequestMaster)
admin.site.register(cart)
admin.site.register(price_table)
admin.site.register(VendorSubList)
admin.site.register(po_list)
admin.site.register(order_status)
admin.site.register(po_master)
admin.site.register(Inward)
admin.site.register(qc_component_type)
admin.site.register(qc_question)
admin.site.register(qc_answer)
admin.site.register(CustomUser)
admin.site.register(register)
admin.site.register(project_details)
admin.site.register(tags_table)
admin.site.register(meta_tags)
admin.site.register(create_tags)
admin.site.register(DamagedInventory)
admin.site.register(Reserved)
admin.site.register(PODelivery)
admin.site.register(Outward)