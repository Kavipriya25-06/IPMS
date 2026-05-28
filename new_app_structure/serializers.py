
from rest_framework import serializers
from .models import ComponentMaster, VendorList, Inventory, BOMList, VendorMaster, BOMMaster, RequestList, RequestMaster

# VendorList Serializer
class VendorListSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorList
        fields = '__all__'  # Fields to display


# # ComponentMaster Serializer
# class ComponentMasterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ComponentMaster
#         fields = ['component_id','category','component_type', 'component_specification', 'unit_of_measurement', 'tally_reference' ,'hsn_number','sku_number','part_number']  # Fields to display


class ComponentMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentMaster
        fields = [
            'component_id','category','component_type','component_specification',
            'unit_of_measurement','tally_reference',
            'hsn_numbers','sku_numbers','part_numbers'
        ]



class vendor_master_serializer(serializers.ModelSerializer):
    class Meta:
        model = VendorMaster
        fields = ['vendor',
                  'product_description',
                  'unit_of_measurement',
                  'component',
                  'img',
                  'attachments',
                  'id',
                  'remarks',
                  
        ]
        







