import { useQuery } from "@tanstack/react-query";
import { agreementLogMock } from "../api/mock/agreementLogMock";
import dayjs from "dayjs";

const DEMO_CONVERSATION_ID = "74cda6f7-0335-4586-94ae-20beaf3d9941";

export function AgreementLogPage() {
  const { data } = useQuery({
    queryKey: ["agreement-logs", DEMO_CONVERSATION_ID],
    queryFn: () => agreementLogMock.list(DEMO_CONVERSATION_ID),
  });

  return (
    <div className="p-6">
      <h1 className="mb-4 text-lg font-medium">합의 기록</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-400">
            <th className="py-2">언제</th>
            <th className="py-2">무엇에</th>
            <th className="py-2">누가</th>
          </tr>
        </thead>
        <tbody>
          {data?.logs.map((log) => (
            <tr key={log.id} className="border-b border-gray-50">
              <td className="py-3 text-gray-500">
                {dayjs(log.agreedAt ?? undefined).format("M/D HH:mm")}
              </td>
              <td className="py-3">
                {log.task} (마감 {dayjs(log.deadline).format("M/D HH:mm")})
              </td>
              <td className="py-3">{log.agreedBy?.displayName ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
