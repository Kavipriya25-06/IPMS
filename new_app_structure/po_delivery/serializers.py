from rest_framework import serializers
from new_app_structure.models import PODelivery, po_master
from new_app_structure.po_master.serializers import get_po_master_serializer

class PODeliverySerializer(serializers.ModelSerializer):
    PO_id = serializers.CharField(source='po_master.PO_id.id', read_only=True)  
    # po_master = get_po_master_serializer(read_only=True)  
    class Meta:
        model = PODelivery
        fields = [
            'id',
            'po_master',
            'PO_id',  # Now clean like "PO_00001"
            'component_id',
            'specification',
            'quantity',
            'order_placed_date_time',
            'shipped_quantity',
            'shipped_date',
            'received_quantity',
            'received_date',
            'inward',
            'pending_quantity', 
        ]



class PODeliveryGetSerializer(serializers.ModelSerializer):
    PO_id = serializers.CharField(source='po_master.PO_id.id', read_only=True)  
    po_master = get_po_master_serializer(read_only=True)
    class Meta:
        model = PODelivery
        fields = [
            'id',
            'po_master',
            'PO_id',  # Now clean like "PO_00001"
            'component_id',
            'specification',
            'quantity',
            'order_placed_date_time',
            'shipped_quantity',
            'shipped_date',
            'received_quantity',
            'received_date',
            'inward',
            'pending_quantity', 
        ]
