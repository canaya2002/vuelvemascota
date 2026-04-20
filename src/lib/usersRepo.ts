import { db } from "./db";

export type UserListItem = {
  id: string;
  clerk_user_id: string;
  email: string;
  nombre: string | null;
  ciudad: string | null;
  rol: string | null;
  verificado: boolean;
  created_at: string;
};

export const usersRepo = {
  async listAll(limit = 200, q?: string): Promise<UserListItem[]> {
    const sql = db.raw;
    if (!sql) return [];
    const like = q ? `%${q}%` : null;
    try {
      const rows = (await sql`
        select id, clerk_user_id, email, nombre, ciudad, rol, verificado, created_at
        from usuarios
        ${
          like
            ? sql`where email ilike ${like} or coalesce(nombre,'') ilike ${like} or coalesce(ciudad,'') ilike ${like}`
            : sql``
        }
        order by created_at desc
        limit ${limit}
      `) as unknown as UserListItem[];
      return rows;
    } catch (err) {
      console.error("[users:listAll:error]", err);
      return [];
    }
  },
};
