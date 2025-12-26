"use client";

import React, { useState } from "react";
import { PortfolioProperty } from "../../lib/types";
import styles from "./PortfolioTable.module.css";

interface PortfolioTableProps {
  data: PortfolioProperty[];
  isEditing: boolean;
  onUpdate: (newData: PortfolioProperty[]) => void;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ data, isEditing, onUpdate }) => {
  const handleChange = (index: number, field: keyof PortfolioProperty, value: string | number) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onUpdate(newData);
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Fund</th>
            <th>Property</th>
            <th>Asset Type</th>
            <th>Units</th>
            <th>Market</th>
            <th>Closing Date</th>
            <th>Purchase Price</th>
            <th>Capital Investment</th>
            <th>Loan Amount</th>
            <th>Debt Type</th>
            <th>Interest Rate</th>
            <th>Maturity Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((property, idx) => (
            <tr key={idx}>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    value={property.fund}
                    onChange={(e) => handleChange(idx, "fund", e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  property.fund
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    value={property.property}
                    onChange={(e) => handleChange(idx, "property", e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  property.property
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    value={property.assetType}
                    onChange={(e) => handleChange(idx, "assetType", e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  property.assetType
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    type="number"
                    value={property.units}
                    onChange={(e) => handleChange(idx, "units", parseInt(e.target.value) || 0)}
                    className={styles.input}
                  />
                ) : (
                  property.units
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    value={property.market}
                    onChange={(e) => handleChange(idx, "market", e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  property.market
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    value={property.closingDate}
                    onChange={(e) => handleChange(idx, "closingDate", e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  property.closingDate
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    value={property.purchasePrice}
                    onChange={(e) => handleChange(idx, "purchasePrice", e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  property.purchasePrice
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    value={property.capitalInvestment}
                    onChange={(e) => handleChange(idx, "capitalInvestment", e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  property.capitalInvestment
                )}
              </td>
              <td className={styles.readOnly}>
                {/* Loan Amount is read-only as per instructions (syncs from sheet AG131) */}
                {property.loanAmount}
              </td>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    value={property.debtType}
                    onChange={(e) => handleChange(idx, "debtType", e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  property.debtType
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    value={property.interestRate}
                    onChange={(e) => handleChange(idx, "interestRate", e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  property.interestRate
                )}
              </td>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    value={property.maturityDate}
                    onChange={(e) => handleChange(idx, "maturityDate", e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  property.maturityDate
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioTable;
