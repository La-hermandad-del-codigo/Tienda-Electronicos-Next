export interface Comment {
    id: string;
    product_id: string;
    user_id: string;
    content: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
    users?: {
        name: string;
        avatar_url?: string;
    };
    replies?: Comment[];
}
