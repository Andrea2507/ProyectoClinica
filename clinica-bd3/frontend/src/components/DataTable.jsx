import JsonBlock from './JsonBlock.jsx';

function renderValue(value) {
  if (value === null || value === undefined || value === '') {
    return <span className="muted">-</span>;
  }

  if (typeof value === 'object') {
    return <JsonBlock value={value} />;
  }

  return String(value);
}

export default function DataTable({ data, columns }) {
  const rows = Array.isArray(data) ? data : [];
  const tableColumns = columns?.length
    ? columns
    : Object.keys(rows[0] || {}).map((key) => ({ key, label: key }));

  if (!rows.length) {
    return null;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {tableColumns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || row._id || index}>
              {tableColumns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : renderValue(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
