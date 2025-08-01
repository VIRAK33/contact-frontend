import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Search, ChevronRight, ChevronDown, Globe, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const SubmissionsView = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['submissions', currentPage, limit],
    queryFn: () => submissionsApi.getAll({ page: currentPage, limit }),
  });

  const deleteMutation = useMutation({
    mutationFn: submissionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast({
        title: "Submission deleted",
        description: "The submission has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting submission",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this submission?')) {
      deleteMutation.mutate(id);
    }
  };

  const submissions = submissionsData?.submissions || [];
  const totalPages = submissionsData?.total_pages || 1;

  const filteredSubmissions = submissions.filter(submission => {
    const searchLower = searchTerm.toLowerCase();
    return (
      submission.integration_id.toLowerCase().includes(searchLower) ||
      JSON.stringify(submission.form_data).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all form submissions from your integrated websites.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-6 font-medium">Timestamp</th>
                    <th className="text-left py-4 px-6 font-medium">Integration</th>
                    <th className="text-left py-4 px-6 font-medium">Preview</th>
                    <th className="text-left py-4 px-6 font-medium">Actions</th>
                    <th className="text-left py-4 px-6 font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <React.Fragment key={submission.id}>
                      <tr 
                        className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleRow(submission.id)}
                      >
                        <td className="py-4 px-6 text-sm text-muted-foreground">
                          {new Date(submission.timestamp).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="font-mono text-sm">{submission.integration_id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            {submission.form_data?.name && (
                              <span className="font-medium">{submission.form_data.name}</span>
                            )}
                            {submission.form_data?.email && (
                              <span className="text-muted-foreground ml-2">({submission.form_data.email})</span>
                            )}
                            {!submission.form_data?.name && !submission.form_data?.email && (
                              <span className="text-muted-foreground">Form submission</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(submission.id);
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                        <td className="py-4 px-6">
                          {expandedRows.has(submission.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </td>
                      </tr>
                      {expandedRows.has(submission.id) && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-muted/20">
                            <div className="space-y-3">
                              <h4 className="font-medium text-sm">Submission Details:</h4>
                              <div className="grid gap-2">
                                {Object.entries(submission.form_data).map(([key, value]) => (
                                  <div key={key} className="flex">
                                    <span className="font-medium text-sm w-32 capitalize">
                                      {key.replace(/_/g, ' ')}:
                                    </span>
                                    <span className="text-sm break-words">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-2 border-t">
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                  <span>ID: {submission.id}</span>
                                  <span>User ID: {submission.user_id}</span>
                                  <span>Integration ID: {submission.integration_id}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No submissions match your search' : 'No submissions found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};