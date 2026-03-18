const ReusableTable = ({ columns, data }) => {
  return (
    <table className="w-full text-sm">

      <thead className="text-xs uppercase text-gray-500 bg-gray-50">
        <tr>
          {columns.map((col) => (
            <th
              key={col.accessor}
              className={col.className}
              onClick={col.onClick}
              style={{ cursor: col.onClick ? "pointer" : "default" }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row) => (
          <tr key={row.symbol} className={row.rowClass || ""}>
            {columns.map((col) => (
              <td key={col.accessor} className={col.className}>
                {col.render ? col.render(row) : row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>

    </table>
  );
};

export default ReusableTable;