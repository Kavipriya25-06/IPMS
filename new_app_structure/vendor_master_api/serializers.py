# from rest_framework import serializers
# from new_app_structure.models import VendorMaster


# class vendor_master_serializer(serializers.ModelSerializer):
    
#     class Meta:
#         model = VendorMaster
#         fields = '__all__'


from rest_framework import serializers
from new_app_structure.models import VendorMaster, VendorSubList, VendorList
# from new_app_structure.vendor_sub_list import VendorSubList_serializers

class vendor_master_serializer(serializers.ModelSerializer):
    vendor_name = serializers.SerializerMethodField()


    class Meta:
        model = VendorMaster
        fields = '__all__'  # includes all model fields
        # vendor_name is not part of the model field, but added as a computed field

    def get_vendor_name(self, obj):
        vendor_name = obj.vendor.vendor_name
        return vendor_name

    # def get_vendor_name(self, obj):
    #     sublist = VendorSubList.objects.filter(vendor=obj.vendor).first()
    #     print("Object",obj.vendor.vendor_id)
    #     qs = VendorSubList.objects.all()
    #     for eachone in qs:
    #         print("Object vendors",eachone)
    #     if sublist:
    #         print("Sublist", sublist)
    #         return sublist.location
    #     return None
