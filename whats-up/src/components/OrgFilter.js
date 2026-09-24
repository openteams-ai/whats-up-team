import React from 'react';

function OrgFilter({ orgs, selectedOrgs, onSelectedOrgsChange }) {
  const toggleOrg = (org) => {
    if (selectedOrgs.includes(org)) {
      onSelectedOrgsChange(selectedOrgs.filter((o) => o !== org));
    } else {
      onSelectedOrgsChange([...selectedOrgs, org]);
    }
  };

  return (
    <section className="org-filter">
      <h2>Filter by Organization</h2>
      <div className="org-options">
        {orgs.map((org) => (
          <label
            key={org}
            className={`org-option${selectedOrgs.includes(org) ? ' selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={selectedOrgs.includes(org)}
              onChange={() => toggleOrg(org)}
            />
            {org}
          </label>
        ))}
        {selectedOrgs.length < orgs.length && (
          <button
            type="button"
            className="org-clear"
            onClick={() => onSelectedOrgsChange(orgs)}
          >
            Select all
          </button>
        )}
        {selectedOrgs.length > 0 && (
          <button
            type="button"
            className="org-clear"
            onClick={() => onSelectedOrgsChange([])}
          >
            Clear
          </button>
        )}
      </div>
      <p className="org-filter-hint">
        {selectedOrgs.length === orgs.length
          ? 'Showing all organizations'
          : `Showing ${selectedOrgs.length} of ${orgs.length} organizations`}
      </p>
    </section>
  );
}

export default OrgFilter;
