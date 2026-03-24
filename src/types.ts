export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Pet {
  id: string;
  userId: string;
  petType: "dog" | "cat" | "other";
  petName: string;
  breed: string;
  color: string;
  location: string;
  lat: number;
  lng: number;
  dateTime: string;
  contact: string;
  images: string[];
  urgency: "low" | "medium" | "high";
  status: "active" | "reunited";
  createdAt: string;
}

export interface Message {
  roomId: string;
  sender: string;
  text: string;
  timestamp: string;
}
