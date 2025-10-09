export type Ticket = {
  id: string;
  movieName: string;
  theaterName: string;
  location: string;
  showDate: string;
  showTime: string;
  ticketCount: number;
  price: number;
  imageUrl: string;
  imageHint: string;
  postedBy: string; // userId
  status: 'available' | 'sold';
};

export type User = {
  id: string;
  name: string;
  email: string;
};
