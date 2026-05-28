from rest_framework import serializers


from rest_framework import serializers

from new_app_structure.models import RequestMaster

class get_RequestMasterSerializer(serializers.ModelSerializer):
    component_type = serializers.CharField(source='component.component_type', read_only=True)
    component_specification = serializers.CharField(source='component.component_specification', read_only=True)
    unit_of_measurement = serializers.CharField(source='component.unit_of_measurement', read_only=True)
    category = serializers.CharField(source='component.category', read_only=True)
    vendor_name = serializers.CharField(source='vendor.vendor.vendor_name', read_only=True)
    bom_detail = serializers.CharField(source='bom.bom.bom_name', read_only=True)
    product_id = serializers.CharField(source='vendor.product_id', read_only=True)
    component_id = serializers.CharField(source='component.component_id', read_only=True)
    request_id = serializers.CharField(source='request.request_id', read_only=True)
    bom_master_id = serializers.CharField(source='bom.id', read_only=True)
    bom_name = serializers.CharField(source='bom.bom.bom_name', read_only=True)
    quantity = serializers.CharField(source='bom.quantity', read_only=True)
    vendor_id= serializers.CharField(source='vendor.vendor_id', read_only=True)
    class Meta:
        model = RequestMaster
        fields = [
            'request_id', 
            'component_id',
            'bom_master_id',
            'status',
            'vendor_id',  
            'product_id',  
            'component_type', 
            'component_specification', 
            'unit_of_measurement', 
            'category', 
            'vendor_name',
            'bom_detail',
            'bom_name',
            'quantity',
            'qty',
            'assign',
            'id',
            'project_id',
            'approve',
            'cart_assign',
            
        ]



class post_request_master_serializer(serializers.ModelSerializer):
    class Meta:
        model = RequestMaster
        # fields = ['request', 'component', 'vendor', 'status', 'qty', 'assign','project_id','approve','cart_assign']
        fields = "__all__"

