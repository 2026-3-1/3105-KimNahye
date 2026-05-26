export class CartItemResponse {
  id: string;
  courseId: string;
  category: string;
  difficulty: string;
  teacher: { id: string; name: string };
  videoCount: number;
  price: number;
  addedAt: Date;
}

export class CartResponse {
  items: CartItemResponse[];
  totalCount: number;
}
