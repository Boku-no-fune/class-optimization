import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { classroomsApi, blocksApi } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Classroom } from '@/types'
import { Pencil, Trash2, Plus, X } from 'lucide-react'

type FormData = Partial<Classroom>

function ClassroomForm({ data, onSave, onCancel }: { data?: Classroom; onSave: (d: FormData) => void; onCancel: () => void }) {
  const { data: blocks = [] } = useQuery({ queryKey: ['blocks'], queryFn: () => blocksApi.list().then(r => r.data) })
  const [form, setForm] = useState<FormData>({
    code: data?.code ?? '',
    name: data?.name ?? '',
    block_id: data?.block_id,
    address: data?.address ?? '',
    nearest_station: data?.nearest_station ?? '',
  })
  const set = (k: keyof FormData, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="grid grid-cols-2 gap-3 p-4 border rounded-md bg-muted/30">
      <div>
        <Label>教室コード *</Label>
        <Input value={form.code} onChange={e => set('code', e.target.value)} placeholder="TK01" />
      </div>
      <div>
        <Label>教室名 *</Label>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="東京教室" />
      </div>
      <div>
        <Label>ブロック *</Label>
        <Select value={form.block_id?.toString()} onChange={e => set('block_id', Number(e.target.value))}>
          <option value="">選択...</option>
          {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
      </div>
      <div>
        <Label>最寄駅</Label>
        <Input value={form.nearest_station} onChange={e => set('nearest_station', e.target.value)} />
      </div>
      <div className="col-span-2">
        <Label>住所</Label>
        <Input value={form.address} onChange={e => set('address', e.target.value)} />
      </div>
      <div className="col-span-2 flex gap-2">
        <Button size="sm" onClick={() => onSave(form)}>保存</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

export function ClassroomsPage() {
  const qc = useQueryClient()
  const { data: classrooms = [], isLoading } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => classroomsApi.list().then(r => r.data),
  })
  const [editing, setEditing] = useState<number | 'new' | null>(null)

  const createMutation = useMutation({
    mutationFn: (d: FormData) => classroomsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classrooms'] }); setEditing(null) },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: FormData & { id: number }) => classroomsApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classrooms'] }); setEditing(null) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => classroomsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classrooms'] }),
  })

  if (isLoading) return <p>読み込み中...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">教室管理</h2>
        <Button size="sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4 mr-1" />追加</Button>
      </div>
      {editing === 'new' && (
        <div className="mb-4">
          <ClassroomForm onSave={(d) => createMutation.mutate(d)} onCancel={() => setEditing(null)} />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>コード</TableHead>
            <TableHead>名前</TableHead>
            <TableHead>ブロック</TableHead>
            <TableHead>最寄駅</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classrooms.map(cr => (
            <>
              <TableRow key={cr.id}>
                <TableCell className="font-mono">{cr.code}</TableCell>
                <TableCell>{cr.name}</TableCell>
                <TableCell>{cr.block?.name}</TableCell>
                <TableCell>{cr.nearest_station}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(editing === cr.id ? null : cr.id)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      if (confirm('削除しますか？')) deleteMutation.mutate(cr.id)
                    }}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {editing === cr.id && (
                <TableRow key={`edit-${cr.id}`}>
                  <TableCell colSpan={5} className="p-0">
                    <ClassroomForm
                      data={cr}
                      onSave={(d) => updateMutation.mutate({ id: cr.id, ...d })}
                      onCancel={() => setEditing(null)}
                    />
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
