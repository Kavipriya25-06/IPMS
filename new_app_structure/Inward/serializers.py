from rest_framework import serializers
# from new.models import cart, po_master, inward
from new_app_structure.models import cart,po_master,Inward



# Cart Serializer
class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = cart
        fields = [
            'component_id',
            'component_type',
            'component_specification',
            'vendor_name',
            'quantity',
        ]

# PO Master Serializer
class POMasterSerializer(serializers.ModelSerializer):
    cart = CartSerializer(source='cart_id', read_only=True)

    class Meta:
        model = po_master
        fields = ['cart','id', 'PO_id']

# Inward Serializer
class get_InwardSerializer(serializers.ModelSerializer):
    po_master = POMasterSerializer(source='po_master_id', read_only=True)

    class Meta:
        model = Inward
        fields = ['po_master', 'serial_number', 'quality_check', 'date','inward_id','quality_check','mode_to_inventory','price','sku_number', 'invoice_number', 'invoice_date','gst' ]
        
        
        
class inward_serializer(serializers.ModelSerializer):
    class Meta:
        model=Inward
        fields='__all__'
        
