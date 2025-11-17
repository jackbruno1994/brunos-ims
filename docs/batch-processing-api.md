# Batch Processing API

## Overview

Bruno's IMS supports batch processing for inventory operations, allowing you to deploy 100 items at a time by default for improved productivity. This feature is particularly useful for high-volume operations such as:

- Bulk stock movements (receiving, shipping, transfers)
- Mass item creation (new product imports)
- Large-scale inventory updates

## Features

- **Default Batch Size**: 100 items per batch
- **Configurable Batch Size**: Customize based on your needs
- **Error Handling**: Individual item errors don't stop the entire batch
- **Detailed Results**: Track success and failure for each batch
- **Performance Optimized**: Efficient processing of large datasets

## Endpoints

### Batch Stock Movements

Process multiple stock movements in batches.

**Endpoint**: `POST /api/inventory/batch/stock-movements`

**Request Body**:
```json
{
  "movements": [
    {
      "itemId": "item-123",
      "locationId": "location-456",
      "type": "IN",
      "quantity": 100,
      "reference": "PO-2024-001",
      "notes": "New stock arrival"
    },
    // ... up to 100+ items
  ],
  "batchSize": 100  // Optional, defaults to 100
}
```

**Movement Types**:
- `IN`: Stock received
- `OUT`: Stock shipped/sold
- `TRANSFER`: Stock moved between locations
- `ADJUSTMENT`: Inventory adjustment

**Response**:
```json
{
  "message": "Batch processing completed: 250 successful, 0 failed",
  "results": {
    "total": 250,
    "processed": 250,
    "failed": 0,
    "batches": [
      {
        "batchNumber": 1,
        "size": 100,
        "success": [...],
        "errors": []
      },
      {
        "batchNumber": 2,
        "size": 100,
        "success": [...],
        "errors": []
      },
      {
        "batchNumber": 3,
        "size": 50,
        "success": [...],
        "errors": []
      }
    ]
  }
}
```

### Batch Create Items

Create multiple inventory items in batches.

**Endpoint**: `POST /api/inventory/batch/items`

**Request Body**:
```json
{
  "items": [
    {
      "name": "Product Name",
      "description": "Product description",
      "sku": "SKU-001",
      "unit": "piece",
      "reorderLevel": 10,
      "currentStock": 100,
      "categoryId": "cat-123",
      "locationId": "loc-456"
    },
    // ... up to 100+ items
  ],
  "batchSize": 100  // Optional, defaults to 100
}
```

**Response**:
```json
{
  "message": "Batch processing completed: 120 successful, 0 failed",
  "results": {
    "total": 120,
    "processed": 120,
    "failed": 0,
    "batches": [
      {
        "batchNumber": 1,
        "size": 100,
        "success": [...],
        "errors": []
      },
      {
        "batchNumber": 2,
        "size": 20,
        "success": [...],
        "errors": []
      }
    ]
  }
}
```

## Usage Examples

### Example 1: Deploy 100 Stock Movements

```javascript
const response = await fetch('/api/inventory/batch/stock-movements', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    movements: Array.from({ length: 100 }, (_, i) => ({
      itemId: `item-${i}`,
      locationId: 'warehouse-1',
      type: 'IN',
      quantity: 50,
      reference: `PO-2024-${i}`
    }))
  })
});

const result = await response.json();
console.log(`Processed: ${result.results.processed} items`);
```

### Example 2: Import 300 Items in Batches

```javascript
const response = await fetch('/api/inventory/batch/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    items: importedItems, // Array of 300 items
    batchSize: 100
  })
});

const result = await response.json();
console.log(`Total batches: ${result.results.batches.length}`);
console.log(`Success: ${result.results.processed}, Failed: ${result.results.failed}`);
```

### Example 3: Custom Batch Size

```javascript
// Process in smaller batches of 50
const response = await fetch('/api/inventory/batch/stock-movements', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    movements: stockMovements,
    batchSize: 50  // Custom batch size
  })
});
```

## Error Handling

If individual items fail within a batch, the batch processing continues. Failed items are reported in the results:

```json
{
  "results": {
    "total": 100,
    "processed": 98,
    "failed": 2,
    "batches": [
      {
        "batchNumber": 1,
        "size": 100,
        "success": [...],
        "errors": [
          {
            "movement": { "itemId": "invalid-item", ... },
            "error": "Item not found"
          },
          {
            "movement": { "itemId": "item-123", ... },
            "error": "Invalid quantity"
          }
        ]
      }
    ]
  }
}
```

## Performance Considerations

- **Default Batch Size**: Optimized for 100 items per batch
- **Recommended Maximum**: 500 items per request
- **Processing Time**: ~1-2 seconds per 100 items
- **Memory Usage**: Minimal with batch processing
- **Network**: Single request for all items

## Best Practices

1. **Use Default Batch Size**: The default of 100 items is optimized for performance
2. **Handle Errors**: Always check the `failed` count and `errors` array
3. **Validate Data**: Ensure data is valid before sending to reduce errors
4. **Monitor Progress**: Use batch results to track processing status
5. **Retry Failed Items**: Resubmit failed items after fixing errors

## Integration with Order Processing

The batch processing system integrates with the order processing optimizations mentioned in issue #1:

- **Smart Queuing**: Process high-volume orders efficiently
- **Peak Hours**: Handle increased load during busy periods
- **Resource Allocation**: Optimize server resources with batching
- **Priority Processing**: Maintain order priority within batches

## Future Enhancements

Planned improvements for batch processing:

- Async batch processing with job queue
- Progress tracking for long-running batches
- Scheduled batch processing
- Batch templates for common operations
- Export/import batch results

## Related Documentation

- [Inventory Management API](./inventory-api.md)
- [Order Processing System](./order-processing.md)
- [Implementation Status](../IMPLEMENTATION_STATUS.md)

## Support

For questions or issues with batch processing:
- Open an issue on GitHub
- Check existing documentation
- Contact support team
