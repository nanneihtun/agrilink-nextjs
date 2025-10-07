"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Users, 
  Package, 
  MessageCircle, 
  CheckCircle, 
  X, 
  Clock,
  Search,
  Shield,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  accountType: string;
  location: string;
  verified: boolean;
  phoneVerified: boolean;
  verificationStatus: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  sellerName: string;
}

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalConversations: number;
  totalMessages: number;
  verifiedUsers: number;
  pendingVerifications: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalConversations: 0,
    totalMessages: 0,
    verifiedUsers: 0,
    pendingVerifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user is admin
      if (parsedUser.email !== "admin@agrilink.com") {
        router.push("/dashboard");
        return;
      }
      
      loadAdminData();
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, [router]);

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Load users
      const usersResponse = await fetch("/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      // Load products
      const productsResponse = await fetch("/api/admin/products", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
      }

      // Load stats
      const statsResponse = await fetch("/api/admin/stats", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string, verified: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ verified }),
      });

      if (response.ok) {
        loadAdminData(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating user verification:", error);
    }
  };

  const handleToggleProduct = async (productId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        loadAdminData(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">User & Product Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified Users</p>
                  <p className="text-2xl font-bold">{stats.verifiedUsers}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Verifications</p>
                  <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Location</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{user.name}</td>
                      <td className="p-2 text-gray-600">{user.email}</td>
                      <td className="p-2">
                        <Badge variant="outline">{user.accountType}</Badge>
                      </td>
                      <td className="p-2 text-gray-600">{user.location}</td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={user.verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {user.verified ? "Verified" : "Unverified"}
                          </Badge>
                          {user.phoneVerified && (
                            <Badge className="bg-blue-100 text-blue-800">Phone ✓</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          {!user.verified ? (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleVerifyUser(user.id, true)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verify
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyUser(user.id, false)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Unverify
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Products Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Product Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Seller</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{product.name}</td>
                      <td className="p-2">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className="p-2 text-gray-600">{product.sellerName}</td>
                      <td className="p-2">
                        <Badge className={product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-2 text-gray-600">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          {product.isActive ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleProduct(product.id, false)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleToggleProduct(product.id, true)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
