import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const ShipmentList: React.FC<{ data: any[], loading: boolean }> = ({ data, loading }) => {
  if (loading) return <Typography>Loading shipments...</Typography>;

  return (
    <div>
      {data.map((shipment) => (
        <Card key={shipment.id} sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="h6">Shipment {shipment.id}</Typography>
            <Typography>Sender: {shipment.senderName}</Typography>
            <Typography>Receiver: {shipment.receiverName}</Typography>
            <Typography>Status: {shipment.status}</Typography>
            <Typography>Price: ${shipment.price}</Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ShipmentList;
