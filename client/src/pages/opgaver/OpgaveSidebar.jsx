import React, { useState } from "react";
import Styles from "./OpgaveSidebar.module.css";
import { Filter, ArrowUpDown, X } from "lucide-react";

const OpgaveSidebar = ({ activeTab, onFilterChange, onSortChange, filters, sortOption, forceVisible = false }) => {
  // Define filter and sort options based on active tab
  const getFilterOptions = (tabId) => {
    switch (tabId) {
      case "new":
      case "open":
        return {
          status: [
            { value: "all", label: "Alle statusser" },
            { value: "Modtaget", label: "Modtaget" },
            { value: "Afventer svar", label: "Afventer svar" },
            { value: "Dato aftalt", label: "Dato aftalt" },
          ],
          kundeType: [
            { value: "all", label: "Alle kunder" },
            { value: "erhverv", label: "Erhverv" },
            { value: "privat", label: "Privat" },
          ],
          timeWarning: [
            { value: "all", label: "Alle" },
            { value: "warning", label: "Med advarsler" },
            { value: "noWarning", label: "Uden advarsler" },
          ],
        };
      case "planned":
      case "current":
        return {
          besøg: [
            { value: "all", label: "Alle besøg" },
            { value: "hasVisits", label: "Med besøg" },
            { value: "noVisits", label: "Uden besøg" },
            { value: "visitsToday", label: "Besøg i dag" },
            { value: "visitsFuture", label: "Fremtidige besøg" },
          ],
          kundeType: [
            { value: "all", label: "Alle kunder" },
            { value: "erhverv", label: "Erhverv" },
            { value: "privat", label: "Privat" },
          ],
        };
      case "unpaid":
        return {
          paymentStatus: [
            { value: "all", label: "Alle" },
            { value: "missingOpkrævning", label: "Mangler opkrævning" },
            { value: "overdue", label: "Over betalingsfrist" },
            { value: "pending", label: "Afventer betaling" },
          ],
          kundeType: [
            { value: "all", label: "Alle kunder" },
            { value: "erhverv", label: "Erhverv" },
            { value: "privat", label: "Privat" },
          ],
        };
      case "done":
      case "closed":
      case "archived":
      case "deleted":
        return {
          kundeType: [
            { value: "all", label: "Alle kunder" },
            { value: "erhverv", label: "Erhverv" },
            { value: "privat", label: "Privat" },
          ],
        };
      default:
        return {};
    }
  };

  const getSortOptions = (tabId) => {
    switch (tabId) {
      case "new":
      case "open":
        return [
          { value: "newest", label: "Nyeste først" },
          { value: "oldest", label: "Ældste først" },
          { value: "name", label: "Navn (A-Z)" },
          { value: "nameDesc", label: "Navn (Z-A)" },
        ];
      case "planned":
      case "current":
        return [
          { value: "nextVisit", label: "Næste besøg" },
          { value: "lastVisit", label: "Sidste besøg" },
          { value: "name", label: "Navn (A-Z)" },
          { value: "nameDesc", label: "Navn (Z-A)" },
        ];
      case "unpaid":
        return [
          { value: "newest", label: "Nyeste først" },
          { value: "oldest", label: "Ældste først" },
          { value: "amountHigh", label: "Højeste beløb" },
          { value: "amountLow", label: "Laveste beløb" },
          // { value: "overdue", label: "Overskredet først" },
          { value: "name", label: "Navn (A-Z)" },
          { value: "nameDesc", label: "Navn (Z-A)" },
        ];
      case "done":
      case "closed":
      case "archived":
      case "deleted":
        return [
          { value: "recent", label: "Senest afsluttet" },
          { value: "oldest", label: "Ældste først" },
          { value: "name", label: "Navn (A-Z)" },
          { value: "nameDesc", label: "Navn (Z-A)" },
        ];
      default:
        return [{ value: "newest", label: "Nyeste først" }];
    }
  };

  const filterOptions = getFilterOptions(activeTab?.id);
  const sortOptions = getSortOptions(activeTab?.id);

  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value,
    });
  };

  const removeFilter = (filterType, event) => {
    event.preventDefault();
    event.stopPropagation();
    const newFilters = { ...filters };
    delete newFilters[filterType];
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = filters && Object.keys(filters).length > 0 && Object.values(filters).some((value) => value !== undefined && value !== null);

  return (
    <aside className={`${Styles.sidebar} ${forceVisible ? Styles.forceVisible : ""}`}>
      {/* {hasActiveFilters && (
        <div className={Styles.sidebarHeader}>
          <button onClick={clearFilters} className={Styles.clearButton} title="Ryd filtre">
            <X size={16} />
            Ryd filtre
          </button>
        </div>
      )} */}

      <div className={Styles.sidebarContent}>
        {/* Sort Section */}
        {sortOptions.length > 0 && (
          <div className={Styles.section}>
            <div className={Styles.sectionHeader}>
              <ArrowUpDown size={16} />
              <span className={Styles.sectionTitle}>Sortér</span>
            </div>
            <div className={Styles.optionsList}>
              {sortOptions.map((option) => {
                const isSelected = sortOption === option.value;
                return (
                  <label 
                    key={option.value} 
                    className={`${Styles.radioOption} ${isSelected ? Styles.selected : ""}`}
                    onClick={(e) => {
                      // Fallback for mouse clicks
                      if (!isSelected) {
                        onSortChange(option.value);
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => onSortChange(e.target.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Sections */}
        {Object.entries(filterOptions).map(([filterType, options]) => (
          <div key={filterType} className={Styles.section}>
            <div className={Styles.sectionHeader}>
              <Filter size={16} />
              <span className={Styles.sectionTitle}>
                {filterType === "status" && "Status"}
                {filterType === "kundeType" && "Kundetype"}
                {filterType === "timeWarning" && "Tidsadvarsel"}
                {filterType === "besøg" && "Besøg"}
                {filterType === "paymentStatus" && "Betalingsstatus"}
              </span>
            </div>
            <div className={Styles.optionsList}>
              {options
                .filter((option) => option.value !== "all") // Remove "all" options
                .map((option) => {
                  const isSelected = (filters && filters[filterType]) === option.value;
                  return (
                    <div 
                      key={option.value} 
                      className={`${Styles.radioOption} ${isSelected ? Styles.selected : ""}`}
                      onClick={(e) => {
                        if (!isSelected && !e.target.closest(`.${Styles.removeFilterButton}`)) {
                          handleFilterChange(filterType, option.value);
                        }
                      }}
                    >
                      <label className={Styles.radioLabel}>
                        <input
                          type="radio"
                          name={filterType}
                          value={option.value}
                          checked={isSelected}
                          onChange={() => handleFilterChange(filterType, option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                      {isSelected && (
                        <button
                          type="button"
                          className={Styles.removeFilterButton}
                          onClick={(e) => removeFilter(filterType, e)}
                          title="Fjern filter"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      {hasActiveFilters && (
        <div className={Styles.sidebarHeader}>
          <button onClick={clearFilters} className={Styles.clearButton} title="Ryd filtre">
            <X size={16} />
            Ryd filtre
          </button>
        </div>
      )}
    </aside>
  );
};

export default OpgaveSidebar;

