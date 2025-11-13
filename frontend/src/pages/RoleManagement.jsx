import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, Edit, Plus, Shield, Users, UserCheck, UserX, Trash2, Key, 
  ToggleLeft, ToggleRight, Settings, Activity, Search, Filter, Download, 
  Upload, MoreVertical, Eye, EyeOff, Crown, Zap, TrendingUp, Clock,
  CheckCircle, XCircle, AlertTriangle, BarChart3, PieChart, Users2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import roleApi from '../services/roleApi';
import UserLogs from '../components/UserLogs';

const RoleManagement = () => {
  const { user: loggedInUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sites, setSites] = useState([]);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Advanced UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table, grid, analytics


  // Form states
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'viewer',
    assignedSites: [],
    status: 1
  });

  // Check if user has permission to manage roles
  const canManageRoles = loggedInUser?.role === 'super_admin' || loggedInUser?.role === 'admin';
  const isSuperAdmin = loggedInUser?.role === 'super_admin';

  // Advanced filtering and analytics
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && user.status === 1) ||
                           (statusFilter === 'inactive' && user.status === 0);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Analytics data
  const analytics = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 1).length;
    const inactiveUsers = totalUsers - activeUsers;
    
    const roleStats = roles.reduce((acc, role) => {
      acc[role.value] = users.filter(u => u.role === role.value).length;
      return acc;
    }, {});

    const recentUsers = users.filter(u => {
      const createdAt = new Date(u.createdAt || Date.now());
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return createdAt > weekAgo;
    }).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      roleStats,
      recentUsers,
      activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
    };
  }, [users, roles]);
  

  useEffect(() => {
    if (canManageRoles) {
      fetchData();
    }
  }, [canManageRoles]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData, sitesResponse] = await Promise.all([
        roleApi.getUsers(),
        roleApi.getRoles(),
        fetch(`${window.location.protocol}//${window.location.hostname}:3001/apiv1/lookups/sites-registry`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const sitesData = await sitesResponse.json();

      if (usersData.success) setUsers(usersData.users);
      if (rolesData.success) setRoles(rolesData.roles);
      // sites-registry API returns array directly, not wrapped in success object
      if (Array.isArray(sitesData)) {
        setSites(sitesData);
      } else if (sitesData.success) {
        setSites(sitesData.sites || []);
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const data = await roleApi.createUser(formData);
      if (data.success) {
        setUsers([...users, data.user]);
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create user');
      console.error('Error creating user:', err);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const data = await roleApi.updateUserRole(selectedUser.id, {
        role: formData.role,
        assignedSites: formData.assignedSites
      });

      if (data.success) {
        setUsers(users.map(u => u.id === selectedUser.id ? data.user : u));
        setIsEditDialogOpen(false);
        resetForm();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update user');
      console.error('Error updating user:', err);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      password: '',
      role: user.role,
      assignedSites: user.assignedSites || [],
      status: user.status
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      password: '',
      role: 'viewer',
      assignedSites: [],
      status: 1
    });
    setPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    try {
      const data = await roleApi.deleteUser(selectedUser.id, true);
      if (data.success) {
        setUsers(users.filter(u => u.id !== selectedUser.id));
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const data = await roleApi.changePassword(
        selectedUser.id, 
        passwordData.newPassword, 
        passwordData.confirmPassword
      );
      if (data.success) {
        setIsPasswordDialogOpen(false);
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setSelectedUser(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to change password');
      console.error('Error changing password:', err);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 1 ? 0 : 1;
      const data = await roleApi.updateUserStatus(user.id, newStatus);
      if (data.success) {
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update user status');
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handlePasswordClick = (user) => {
    setSelectedUser(user);
    setIsPasswordDialogOpen(true);
  };

  // Bulk operations
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      const promises = selectedUsers.map(userId => 
        roleApi.updateUserStatus(userId, newStatus)
      );
      await Promise.all(promises);
      
      setUsers(users.map(u => 
        selectedUsers.includes(u.id) ? { ...u, status: newStatus } : u
      ));
      setSelectedUsers([]);
      setShowBulkActions(false);
    } catch (err) {
      setError('Failed to update user statuses');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const promises = selectedUsers.map(userId => 
        roleApi.deleteUser(userId, true)
      );
      await Promise.all(promises);
      
      setUsers(users.filter(u => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
      setShowBulkActions(false);
    } catch (err) {
      setError('Failed to delete users');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-purple-100 text-purple-800',
      doctor: 'bg-blue-100 text-blue-800',
      nurse: 'bg-green-100 text-green-800',
      data_entry: 'bg-yellow-100 text-yellow-800',
      viewer: 'bg-gray-100 text-gray-800',
      site_manager: 'bg-indigo-100 text-indigo-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (!canManageRoles) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to manage user roles.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Advanced Header */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-none">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-primary">
                    Role Management
                  </h1>
                  <p className="text-muted-foreground text-lg">Advanced user & permission control center</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
             
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className=" from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new user with specific role and permissions</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                      {roles.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignedSites">Assigned Sites (Optional)</Label>
                  <Select 
                    value={formData.assignedSites.length > 0 ? formData.assignedSites[0] : ''} 
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setFormData({...formData, assignedSites: []});
                      } else {
                        setFormData({...formData, assignedSites: [value]});
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sites or leave empty for all" />
                    </SelectTrigger>
                    <SelectContent className="" position="popper">
                      <SelectItem value="all">All Sites</SelectItem>
                      {sites.map(site => (
                        <SelectItem key={site.code} value={site.code}>
                          {site.name} ({site.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-primary">
                    Create User
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{analytics.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-none">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Users</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{analytics.activeUsers}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">{analytics.activePercentage}% of total</p>
                </div>
                <div className="p-3 bg-green-500 rounded-none">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Recent Users</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{analytics.recentUsers}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Last 7 days</p>
                </div>
                <div className="p-3 bg-orange-500 rounded-none">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Admin Users</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {(analytics.roleStats.super_admin || 0) + (analytics.roleStats.admin || 0)}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Super Admin + Admin</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-none">
                  <Crown className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Search and Filters */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-background backdrop-blur-sm">
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background backdrop-blur-sm">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users & Roles
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              User Logs
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Bulk Actions Bar */}
            {selectedUsers.length > 0 && (
              <Card className="/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="font-medium text-primary">
                        {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkStatusChange(1)}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Activate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkStatusChange(0)}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Deactivate
                      </Button>
                      {isSuperAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkDelete}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUsers([])}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Users Table */}
            <Card className=" border-border/50 p-2">
              <CardHeader className="bg-gradient-to-r from-card to-card/80">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-none">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">User Management</h3>
                      <p className="text-sm text-muted-foreground">
                        {filteredUsers.length} of {users.length} users
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {analytics.activeUsers} Active
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {analytics.inactiveUsers} Inactive
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="min-w-[140px]">User</TableHead>
                        <TableHead className="min-w-[120px]">Role</TableHead>
                        <TableHead className="min-w-[150px]">Sites</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px]">Last Login</TableHead>
                        <TableHead className="min-w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => handleSelectUser(user.id, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-foreground">{user.username}</div>
                              <div className="text-sm text-muted-foreground">{user.fullName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {roles.find(r => r.value === user.role)?.label || user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user.assignedSites && user.assignedSites.length > 0 
                                ? user.assignedSites.join(', ')
                                : <span className="text-muted-foreground">All Sites</span>
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.status === 1 ? "default" : "secondary"}
                              className={user.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                            >
                              {user.status === 1 ? (
                                <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                              ) : (
                                <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                title="Edit User"
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePasswordClick(user)}
                                title="Change Password"
                                className="h-8 w-8 p-0"
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(user)}
                                title={user.status === 1 ? "Deactivate User" : "Activate User"}
                                className="h-8 w-8 p-0"
                              >
                                {user.status === 1 ? (
                                  <UserX className="h-4 w-4 text-orange-600" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                              
                              {isSuperAdmin && user.id !== loggedInUser?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(user)}
                                  title="Delete User"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Role Distribution */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Role Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roles.map(role => {
                      const count = analytics.roleStats[role.value] || 0;
                      const percentage = analytics.totalUsers > 0 ? Math.round((count / analytics.totalUsers) * 100) : 0;
                      return (
                        <div key={role.value} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{role.label}</span>
                            <span className="text-sm text-muted-foreground">{count} users ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-none h-2">
                            <div 
                              className=" h-2 rounded-none transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* User Activity */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    User Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-none">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-none">
                          <UserCheck className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-100">Active Users</p>
                          <p className="text-sm text-green-600 dark:text-green-400">{analytics.activeUsers} users</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analytics.activePercentage}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-none">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-500 rounded-none">
                          <UserX className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Inactive Users</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{analytics.inactiveUsers} users</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {100 - analytics.activePercentage}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-none">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-none">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100">Recent Signups</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Last 7 days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analytics.recentUsers}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Site Distribution */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users2 className="h-5 w-5 text-primary" />
                  Site Assignment Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sites.slice(0, 6).map(site => {
                    const assignedUsers = users.filter(u => 
                      u.assignedSites && u.assignedSites.includes(site.code)
                    ).length;
                    return (
                      <div key={site.code} className="p-4 border rounded-none hover:bg-muted/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{site.name}</h4>
                          <Badge variant="outline" className="text-xs">{site.code}</Badge>
                        </div>
                        <p className="text-2xl font-bold text-primary">{assignedUsers}</p>
                        <p className="text-xs text-muted-foreground">assigned users</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <UserLogs users={users} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>Update user role and assigned sites</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input value={formData.username} disabled />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input value={formData.fullName} disabled />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="">
                    {roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-assignedSites">Assigned Sites</Label>
                <Select 
                  value={formData.assignedSites.length > 0 ? formData.assignedSites[0] : 'all'} 
                  onValueChange={(value) => {
                    if (value === 'all') {
                      setFormData({...formData, assignedSites: []});
                    } else {
                      setFormData({...formData, assignedSites: [value]});
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sites" />
                  </SelectTrigger>
                  <SelectContent className="" position="popper">
                    <SelectItem value="all">All Sites</SelectItem>
                    {sites.map(site => (
                      <SelectItem key={site.code} value={site.code}>
                        {site.name} ({site.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary">
                  Update User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete user "{selectedUser?.username}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Change password for user "{selectedUser?.username}"
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Role Management Component
export default RoleManagement;
