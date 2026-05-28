from rest_framework import serializers
from new_app_structure.models import BOMMaster, RequestMaster, VendorList, ComponentMaster, VendorMaster, price_table
from new_app_structure.serializers import ComponentMasterSerializer, VendorListSerializer

class GET_BOMMasterSerializer(serializers.ModelSerializer):
    vendor = VendorListSerializer()  # Assuming this is defined
    component = ComponentMasterSerializer()  # Assuming this is defined
    product_id = serializers.CharField(source='vendor.product_id', read_only=True)  # Get product_id from vendor
    
    class Meta:
        model = BOMMaster
        fields = [
            'bom',  # Include the ForeignKey field
            'component', 
            'quantity',
            'vendor',
            'product_id',
            'id',
            'price',
            'tax',
            'date',


        ]


class POST_BOMMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = BOMMaster
        fields = '__all__'

        
# from rest_framework import serializers












#################################################################################################

##################  all compoents serializer start ################################################## 

######################################################################################################


class VendorListSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorList
        fields = ['vendor_id', 'vendor_name']


class price_table_serializer(serializers.ModelSerializer):
    class Meta:
        model = price_table
        fields = ['price']


class VendorMasterSerializer(serializers.ModelSerializer):
    vendor = VendorListSerializer()  # Nested serializer for vendor details
    price =price_table_serializer()
    class Meta:
        model = VendorMaster
        fields = ['product_id', 'component_type', 'component_specification', 'vendor']

class ComponentMasterSerializer(serializers.ModelSerializer):
    product_details = VendorMasterSerializer(source='vendor', read_only=True)  # Fetch VendorMaster data by matching product_id

    class Meta:
        model = ComponentMaster
        fields = ['component_type', 'component_specification', 'product_details']





#################################################################################################

##################  all components serializer end ################################################## 

######################################################################################################


#######################################################################################################
                #   http://127.0.0.1:8000/price_view/

#############################################################################################


class VendorMasterSerializer(serializers.ModelSerializer):
    latest_price = serializers.SerializerMethodField()

    class Meta:
        model = VendorMaster
        fields = ['product_id', 'product_description', 'latest_price','component_type','component_specification']

    def get_latest_price(self, obj):
        # Get the latest price entry for the given VendorMaster
        latest_price_entry = price_table.objects.filter(product=obj).order_by('-current_time').first()
        if latest_price_entry:
            return price_table_serializer(latest_price_entry).data
        return None


class RequestMasterSerializer(serializers.ModelSerializer):
    vendor_details = serializers.SerializerMethodField()

    class Meta:
        model = RequestMaster
        fields = ['request', 'component', 'vendor', 'status', 'qty', 'assign', 'vendor_details']

    def get_vendor_details(self, obj):
        # Fetch the related VendorMaster for the given vendor
        vendor_master_queryset = VendorMaster.objects.filter(vendor=obj.vendor)
        return VendorMasterSerializer(vendor_master_queryset, many=True).data



#######################################################################################################
                #   http://127.0.0.1:8000/price_view/ --end

#############################################################################################




#part_2 of price_view_2


class price_table_serializer(serializers.ModelSerializer):
    class Meta:
        model = price_table
        fields = '__all__'


class VendorListSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorList
        fields = ['vendor_id', 'vendor_name']


# class RequestMasterSerializer_2(serializers.ModelSerializer):
    

#     vendor_id = serializers.CharField(source="vendor.vendor_id")
#     vendor_name = serializers.CharField(source="vendor.vendor_name")
#     latest_price = serializers.SerializerMethodField()

#     class Meta:
#         model = VendorMaster
#         fields = ['vendor_id', 'vendor_name', 'component_type', 'component_specification', 'latest_price','tax']

#     def get_latest_price(self, obj):
#         # Fetch the latest price for the current vendor's product
#         latest_price = obj.price_table_set.order_by('-current_time').first()
#         return latest_price.price if latest_price else None
    
#     def get_latest_tax(self, obj):
#         # Fetch the latest price for the current vendor's product
#         tax = obj.price_table_set.order_by('-current_time').first()
#         return tax.price if tax else None

class RequestMasterSerializer_2(serializers.ModelSerializer):
    vendor_id = serializers.CharField(source="vendor.vendor_id")
    vendor_name = serializers.CharField(source="vendor.vendor_name")
    latest_price = serializers.SerializerMethodField()
    latest_tax = serializers.SerializerMethodField()

    class Meta:
        model = VendorMaster
        fields = ['vendor_id', 'vendor_name', 'component_type', 'component_specification', 'latest_price', 'latest_tax']

    def get_latest_value(self, obj, field_name):
        """
        Fetch the latest value for a given field from the price_table_set.
        """
        latest_entry = obj.price_table_set.order_by('-current_time').first()
        return getattr(latest_entry, field_name, None) if latest_entry else None

    def get_latest_price(self, obj):
        return self.get_latest_value(obj, 'price')

    def get_latest_tax(self, obj):
        return self.get_latest_value(obj, 'tax')
