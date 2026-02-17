import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Edit, Plus, Shield, Users, UserCheck, UserX, Trash2, Key, ToggleLeft, ToggleRight, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import roleApi from '../services/roleApi';

const RoleManagement = () => {
  const { user } = useAuth();
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
  const canManageRoles = user?.role === 'super_admin' || user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';

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
        fetch('http://localhost:3001/apiv1/sites', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const sitesData = await sitesResponse.json();

      if (usersData.success) setUsers(usersData.users);
      if (rolesData.success) setRoles(rolesData.roles);
      if (sitesData.success) setSites(sitesData.sites || []);
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

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-destructive/10 text-destructive border-transparent',
      admin: 'bg-primary/10 text-primary border-transparent',
      doctor: 'bg-secondary text-secondary-foreground',
      nurse: 'bg-secondary text-secondary-foreground',
      data_entry: 'bg-muted text-muted-foreground',
      viewer: 'bg-muted text-muted-foreground',
      site_manager: 'bg-secondary text-secondary-foreground'
    };
    return colors[role] || 'bg-muted text-muted-foreground';
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
    <div className="min-h-screen ">
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-background">
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
                    <SelectContent>
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
                    <SelectContent>
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

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users & Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Sites</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {roles.find(r => r.value === user.role)?.label || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.assignedSites && user.assignedSites.length > 0 
                        ? user.assignedSites.join(', ')
                        : 'All Sites'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 1 ? "default" : "secondary"}>
                        {user.status === 1 ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePasswordClick(user)}
                          title="Change Password"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 1 ? "Deactivate User" : "Activate User"}
                        >
                          {user.status === 1 ? (
                            <ToggleRight className="h-4 w-4 text-primary" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        
                        {isSuperAdmin && user.id !== user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                            title="Delete User"
                            className="text-destructive hover:bg-destructive/10"
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
          </CardContent>
        </Card>

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
                  <SelectContent>
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
                  <SelectContent>
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

export default RoleManagement;
