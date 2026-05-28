from rest_framework import serializers
from new_app_structure.models import RequestList


class request_serializer(serializers.ModelSerializer):
    bom_id = serializers.CharField(source='bom.bom_id', read_only=True)  # Assuming bom_id is a field in BOMMaster

    class Meta:
        model = RequestList
        # fields = [ 'request_id', 'requester_name', 'date', 'status', 'last_modified_by', 'bom_id']
        fields='__all__'