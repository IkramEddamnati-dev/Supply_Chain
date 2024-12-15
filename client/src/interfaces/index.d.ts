
export interface IShipment {
  id:number,
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  distributorId: number;
  pickupTime: number; // Assuming time is in hours or timestamp
  deliveryTime: number; // Assuming time is in hours or timestamp
  distance: number; // Distance in kilometers
  price: number; // Price in currency
  description: string; // Shipment description
  status: number; // Shipment status (e.g., 0 for Pending, 1 for Completed)
  isPaid: boolean; // Payment status (true for paid, false for unpaid)
}


export interface IUser {
  id: number;
  name: string;
  email: string;
  fullName: string;
  gender: string;
  gsm: string;
  createdAt: string;
  isActive: boolean;
  avatar: IFile[];
  addresses: IAddress[];
}

export interface IIdentity {
  id: number;
  name: string;
  avatar: string;
}

export interface IAddress {
  text: string;
  coordinate: [string | number, string | number];
}

export interface IFile {
  lastModified?: number;
  name: string;
  percent?: number;
  size: number;
  status?: "error" | "success" | "done" | "uploading" | "removed";
  type: string;
  uid?: string;
  url: string;
}

export interface IEvent {
  date: string;
  status: string;
}

export interface IRMS {
  id: number;
  name: string;
  description: string;
  price: number;
  image:  string;
  origin: IAddress;
  
}



export interface IProduct {
  id: number;
  name: string;
  isActive: boolean;
  description: string;
  image: string;
  rwIds:number[];
  manufacturerId:number;
  price: number;
  categoryId: ICategory;
  distributorId:number;
  
}

export interface ICategory {
  id: number;
  title: string;
  isActive: boolean;
}



export interface ITrendingProducts {
  id: number;
  product: IProduct;
  orderCount: number;
}



export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
