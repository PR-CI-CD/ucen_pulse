import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LocalStorageRecordsRepository } from "../lib/recordsRepository";

const repo = new LocalStorageRecordsRepository();

export default function RecordDetailPage() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await repo.getById(id);
      if (alive) setRecord(r);
    })();
    const unsub = repo.subscribe?.(async () => {
      const r = await repo.getById(id);
      setRecord(r);
    });
    return () => { alive = false; unsub && unsub(); };
  }, [id]);

  if (!record) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Record not found</h1>
        <p className="text-gray-600 mt-2">It may have been deleted or moved.</p>
      </main>
    );
  }

  const isActivity = record.kind === "activity";
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {isActivity
          ? `${record.type} — ${record.duration} min`
          : `${record.type} — ${record.value}${record.unit ? ` ${record.unit}` : ""}`}
      </h1>

      <div className="space-y-2 text-sm">
        <div><span className="font-medium">Type:</span> {record.kind}</div>
        <div><span className="font-medium">Date:</span> {record.dateISO}</div>
        {isActivity && <div><span className="font-medium">Duration:</span> {record.duration} min</div>}
        {!isActivity && (
          <>
            <div><span className="font-medium">Value:</span> {record.value}</div>
            {record.unit && <div><span className="font-medium">Unit:</span> {record.unit}</div>}
          </>
        )}
        {record.notes && (
          <div className="pt-2">
            <div className="font-medium">Notes</div>
            <p className="text-gray-700 whitespace-pre-wrap">{record.notes}</p>
          </div>
        )}
      </div>
    </main>
  );
}
