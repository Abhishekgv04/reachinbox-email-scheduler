function StatCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="stat-card">

      <div className="stat-header">

        <div className="stat-icon">
          <Icon size={20} />
        </div>

        <span>
          {title}
        </span>

      </div>

      <h2>
        {value}
      </h2>

      <p>
        {description}
      </p>

    </div>
  );
}

export default StatCard;