import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blocksApi } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Block } from '@/types'
import { Pencil, Trash2, Plus } from 'lucide-react'

function BlockForm({ block, onSave, onCancel }: { block?: Block; onSave: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(block?.name ?? '')
  return (
    <div className="flex gap-2 items-center">
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="ブロック名" className="w-48" />
      <Button size="sm" onClick={() => onSave(name)}>保存</Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>キャンセル</Button>
    </div>
  )
}

export function BlocksPage() {
  const qc = useQueryClient()
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['blocks'],
    queryFn: () => blocksApi.list().then(r => r.data),
  })
  const [editing, setEditing] = useState<number | 'new' | null>(null)

  const createMutation = useMutation({
    mutationFn: (name: string) => blocksApi.create({ name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blocks'] }); setEditing(null) },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => blocksApi.update(id, { name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blocks'] }); setEditing(null) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => blocksApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks'] }),
  })

  if (isLoading) return <p>読み込み中...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">ブロック管理</h2>
        <Button size="sm" onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4 mr-1" />追加
        </Button>
      </div>
      {editing === 'new' && (
        <div className="mb-4 p-4 border rounded-md bg-muted/30">
          <BlockForm
            onSave={(name) => createMutation.mutate(name)}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>名前</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blocks.map(block => (
            <TableRow key={block.id}>
              <TableCell className="text-muted-foreground">{block.id}</TableCell>
              <TableCell>
                {editing === block.id ? (
                  <BlockForm
                    block={block}
                    onSave={(name) => updateMutation.mutate({ id: block.id, name })}
                    onCancel={() => setEditing(null)}
                  />
                ) : block.name}
              </TableCell>
              <TableCell className="text-right">
                {editing !== block.id && (
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(block.id)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      if (confirm('削除しますか？')) deleteMutation.mutate(block.id)
                    }}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
