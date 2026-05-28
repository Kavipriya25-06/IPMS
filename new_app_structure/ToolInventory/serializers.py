# # app_name/serializers.py
# from rest_framework import serializers
# from new_app_structure.models import ToolInventory

# class ToolInventorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ToolInventory
#         fields = '__all__'


# app_name/serializers.py

from rest_framework import serializers
from new_app_structure.models import ToolInventory, ToolInventoryEntry


class ToolInventoryEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ToolInventoryEntry
        fields = [
            "id",
            "status",       # boolean (default True)
            "vendor",
            "unit_price",
            "gst",
            "total_price",  # read-only auto computed
            "remarks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["total_price", "created_at", "updated_at"]


class ToolInventorySerializer(serializers.ModelSerializer):
    tool_id = serializers.ReadOnlyField()

    # show entries inside tool
    entries = ToolInventoryEntrySerializer(many=True, read_only=True)

    class Meta:
        model = ToolInventory
        fields = [
            "id",
            "tool_id",
            "tool_name",   # mandatory
            "remarks",     # nullable
            "entries",
            "created_at",
            "updated_at",
        ]


#  Create entry inside tool using tool_id string (T_00001)
class ToolInventoryEntryCreateSerializer(serializers.ModelSerializer):
    tool_id = serializers.CharField(write_only=True)

    class Meta:
        model = ToolInventoryEntry
        fields = [
            "id",
            "tool_id",     # user sends tool_id
            "status",
            "vendor",
            "unit_price",
            "gst",
            "remarks",
        ]

    def validate_tool_id(self, value):
        if not ToolInventory.objects.filter(tool_id=value).exists():
            raise serializers.ValidationError("Invalid tool_id")
        return value

    def create(self, validated_data):
        tool_id = validated_data.pop("tool_id")
        tool = ToolInventory.objects.get(tool_id=tool_id)
        return ToolInventoryEntry.objects.create(tool=tool, **validated_data)
