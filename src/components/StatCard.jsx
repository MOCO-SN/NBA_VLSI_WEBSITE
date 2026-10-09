import {
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

function StatCard({
  title,
  value,
  change,
  positive,
  icon: Icon
}) {
  return (
    <div className="stat-card">

      <div className="stat-top">

        <div className="stat-icon">
          <Icon size={20} />
        </div>

        <div
          className={`stat-change ${
            positive
              ? "positive"
              : "negative"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}

          {change}
        </div>

      </div>

      <div className="stat-content">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}

export default StatCard;