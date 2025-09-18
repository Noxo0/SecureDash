import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth-utils";

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export default function Users() {
  const { data, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch("/api/admin/users", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  return (
    <main className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">User Management</h2>
        <p className="text-muted-foreground">Manage users, roles, and access.</p>
      </div>

      {isLoading && (
        <div className="p-6 border border-border bg-card rounded-lg">Loading users…</div>
      )}
      {error && (
        <div className="p-6 border border-border bg-card rounded-lg text-red-400">Error loading users</div>
      )}

      {data && (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-card/50 border-b border-border text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Username</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id} className="border-b border-border/60">
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2"><span className="px-2 py-0.5 rounded bg-secondary/50">{u.role}</span></td>
                  <td className="px-4 py-2">{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</td>
                  <td className="px-4 py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
