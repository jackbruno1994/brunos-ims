import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Item } from '../../types/inventory';

const ItemList: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            sorter: (a: Item, b: Item) => a.sku.localeCompare(b.sku),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: Item, b: Item) => a.name.localeCompare(b.name),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            filters: [
                // Will be populated dynamically from available categories
            ],
            onFilter: (value: boolean | React.Key, record: Item) => record.category === value,
        },
        {
            title: 'Current Stock',
            dataIndex: 'currentStock',
            key: 'currentStock',
            render: (stock: number, record: Item) => (
                <span style={{ color: stock <= record.minStock ? 'red' : 'inherit' }}>
                    {stock}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_text: string, record: Item) => (
                <Space>
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)}
                    />
                    <Button 
                        icon={<DeleteOutlined />} 
                        danger 
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/inventory/items');
            setItems(response.data);
        } catch (error) {
            message.error('Failed to fetch items');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (_item: Item) => {
        // Implementation for edit functionality
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/inventory/items/${id}`);
            message.success('Item deleted successfully');
            fetchItems();
        } catch (error) {
            message.error('Failed to delete item');
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => {/* Implementation for add new item */}}
                >
                    Add New Item
                </Button>
            </div>
            <Table 
                columns={columns} 
                dataSource={items}
                loading={loading}
                rowKey="id"
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total: number) => `Total ${total} items`
                }}
            />
        </div>
    );
};

export default ItemList;