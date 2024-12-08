import { type PropsWithChildren, useMemo, useState, useEffect } from "react";
import { useGo, useNavigation, useTranslate } from "@refinedev/core";
import { CreateButton, EditButton, useDataGrid } from "@refinedev/mui";
import { useLocation } from "react-router-dom";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { RefineListView } from "../../components";
import { IShipment } from "../../interfaces"; // Interface defined above
import { Button, Menu, MenuItem, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Tooltip } from "@mui/material";
import { PlayArrow, CheckCircle } from "@mui/icons-material";
export const ShipmentList = ({ children }: PropsWithChildren) => {
  const [shipments, setShipments] = useState<IShipment[]>([]); // State to hold shipments data
  const [loading, setLoading] = useState<boolean>(true); // State to track loading
  const [selectedShipment, setSelectedShipment] = useState<IShipment | null>(null); // State to hold selected shipment for the modal
  const [openModal, setOpenModal] = useState<boolean>(false); // State to control modal visibility
  const [selectedShipmentId, setSelectedShipmentId] = useState<number | null>(null);

  const go = useGo();
  const { pathname } = useLocation();
  const { createUrl } = useNavigation();
  const t = useTranslate();

  // Fetch data from API using useEffect
  const fetchShipments = async () => {
    const userId = localStorage.getItem("userId"); // Get userId from localStorage

    if (!userId) {
      console.error("User ID not found in localStorage");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/shipments/${userId}`); // Pass userId to the API URL
      const data = await response.json();
      setShipments(data); // Set fetched data into state
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching shipments:", error);
      setLoading(false); // Stop loading even if there is an error
    }
  };

  useEffect(() => {
    fetchShipments(); // Fetch shipments when the component mounts
  }, []);


 const handleStartShipment = async () => {
  if (selectedShipmentId !== null) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/start_shipment/${selectedShipmentId}`, {
        method: "POST",
      });
      const result = await response.json();
      if (result.status === "success") {
        alert("Shipment started successfully!");
        fetchShipments(); // Refetch the shipments after starting
      } else {
        alert("Failed to start shipment");
      }
    } catch (error) {
      console.error("Error starting shipment:", error);
      alert("Error starting shipment");
    }
  }
};

const handleCompleteShipment = async () => {
  if (selectedShipmentId !== null) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/complete_shipment/${selectedShipmentId}`, {
        method: "POST",
      });
      const result = await response.json();
      if (result.status === "success") {
        alert("Shipment completed successfully!");
        fetchShipments(); // Refetch the shipments after completing
      } else {
        alert("Failed to complete shipment");
      }
    } catch (error) {
      console.error("Error completing shipment:", error);
      alert("Error completing shipment");
    }
  }
};


  // Define columns for DataGrid
  const columns = useMemo<GridColDef<IShipment>[]>(() => [
    {
      field: "senderName",
      headerName: "Sender",
      width: 150,
      renderCell: ({ row }) => <Typography>{row.senderName}</Typography>,
    },
    {
      field: "receiverName",
      headerName: "Receiver",
      width: 150,
      renderCell: ({ row }) => <Typography>{row.receiverName}</Typography>,
    },
    {
      field: "pickupTime",
      headerName: "Pickup Time",
      width: 120,
      renderCell: ({ row }) => <Typography>{row.pickupTime} hours</Typography>,
    },
    {
      field: "price",
      headerName: "Price ($)",
      width: 120,
      renderCell: ({ row }) => <Typography>${row.price}</Typography>,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: ({ row }) => {
        const statusMap = {
          0: "PENDING",
          1: "IN TRANSIT",
          2: "DELIVERED",
        };
        return <Typography>{statusMap[row.status]}</Typography>;
      },
    },
    {
      field: "isPaid",
      headerName: "Payment Status",
      width: 120,
      renderCell: ({ row }) => <Typography>{row.isPaid ? "Paid" : "Unpaid"}</Typography>,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      renderCell: ({ row }) => {
        // Only show action buttons if status is either pending or in transit
        if (row.status === 0 || row.status === 1) {
          return (
            <div>
              {row.status === 0 && (
                <Tooltip title="Start Shipment" arrow>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setSelectedShipmentId(row.id);
                      handleStartShipment();
                    }}
                    size="small"
                    sx={{ minWidth: 40 }} 
                  >
                    <PlayArrow  sx={{ fontSize: 24 }}/>
                  </Button>
                </Tooltip>
              )}
              {row.status === 1 && (
                <Tooltip title="Complete Shipment" arrow>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      setSelectedShipmentId(row.id);
                      handleCompleteShipment();
                    }}
                    size="small"
                    sx={{ minWidth: 40 }}
                  >
                    <CheckCircle sx={{ fontSize: 24 }}/>
                  </Button>
                </Tooltip>
              )}
            </div>
          );
        }
        if (row.status === 2) {
      return (
        <div>
          <Tooltip title="Shipment Completed" arrow>
            <Button
              variant="contained"
              color="success"
              size="small"
              sx={{ minWidth: 40 }}
            >
              <CheckCircle sx={{ fontSize: 24 }} />
            </Button>
          </Tooltip>
        </div>
      );
    }
        return null;
      },
    },
  ], [t]);

  // If loading, show a loading message or spinner
  if (loading) {
    return <Typography>Loading shipments...</Typography>;
  }

  const handleRowClick = (shipment: IShipment) => {
    setSelectedShipment(shipment); // Set selected shipment data
    setOpenModal(true); // Open modal
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Close modal
    setSelectedShipment(null); // Clear selected shipment
  };

  return (
    <>
      <RefineListView>
        <Paper>
          <DataGrid
            rows={shipments} // Pass the shipments data to DataGrid
            columns={columns}
            sx={{}}
            autoHeight
            pageSizeOptions={[10, 20, 50, 100]}
            pagination
            onRowClick={(params) => handleRowClick(params.row)} // Open modal on row click
          />
        </Paper>
      </RefineListView>

      {/* Modal to show shipment details */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Shipment Details</DialogTitle>
        <DialogContent>
          {selectedShipment && (
            <>
              <Typography variant="body1"><strong>Sender:</strong> {selectedShipment.senderName}</Typography>
              <Typography variant="body1"><strong>Receiver:</strong> {selectedShipment.receiverName}</Typography>
              <Typography variant="body1"><strong>Status:</strong> {selectedShipment.status}</Typography>
              <Typography variant="body1"><strong>Pickup Time:</strong> {selectedShipment.pickupTime} hours</Typography>
              <Typography variant="body1"><strong>Delivery Time:</strong> {selectedShipment.deliveryTime || "Not delivered yet"}</Typography>
              <Typography variant="body1"><strong>Distance:</strong> {selectedShipment.distance} km</Typography>
              <Typography variant="body1"><strong>Price:</strong> ${selectedShipment.price}</Typography>
              <Typography variant="body1"><strong>Description:</strong> {selectedShipment.description}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {children}
    </>
  );
};
