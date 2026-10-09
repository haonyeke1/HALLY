import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  DollarSign,
  FileText,
  AlertTriangle,
  Sparkles,
  Info,
} from 'lucide-react';
import { InvoiceItem, DocumentItem, DeadlineItem } from '../types';

interface CalendarViewProps {
  invoices: InvoiceItem[];
  documents: DocumentItem[];
  deadlines: DeadlineItem[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  invoices,
  documents,
  deadlines,
}) => {
  // Fixed to October 2026 as standard anchor
  const [selectedDay, setSelectedDay] = useState<number | null>(8); // Oct 8, 2026

  // Aggregate all calendar events with YYYY-MM-DD
  const events: Array<{
    id: string;
    title: string;
    date: string;
    day: number;
    type: 'invoice' | 'document' | 'deadline';
    category: string;
    amount?: number;
    status?: string;
  }> = [];

  invoices.forEach((inv) => {
    if (inv.dueDate && inv.dueDate.startsWith('2026-10')) {
      const day = parseInt(inv.dueDate.split('-')[2], 10);
      events.push({
        id: inv.id,
        title: `Invoice ${inv.invoiceNumber} due (${inv.customerName})`,
        date: inv.dueDate,
        day,
        type: 'invoice',
        category: 'Invoice Due',
        amount: inv.invoiceAmount,
        status: inv.status,
      });
    }
  });

  documents.forEach((doc) => {
    if (doc.expiryDate && doc.expiryDate.startsWith('2026-10')) {
      const day = parseInt(doc.expiryDate.split('-')[2], 10);
      events.push({
        id: doc.id,
        title: `${doc.name} Expiration`,
        date: doc.expiryDate,
        day,
        type: 'document',
        category: doc.type,
        status: doc.status,
      });
    }
    if (doc.renewalDate && doc.renewalDate.startsWith('2026-10')) {
      const day = parseInt(doc.renewalDate.split('-')[2], 10);
      events.push({
        id: `${doc.id}_renewal`,
        title: `${doc.name} Renewal Cutoff`,
        date: doc.renewalDate,
        day,
        type: 'document',
        category: 'Renewal Window',
        status: 'Renewal Pending',
      });
    }
  });

  deadlines.forEach((dl) => {
    if (dl.deadlineDate && dl.deadlineDate.startsWith('2026-10')) {
      const day = parseInt(dl.deadlineDate.split('-')[2], 10);
      events.push({
        id: dl.id,
        title: dl.title,
        date: dl.deadlineDate,
        day,
        type: 'deadline',
        category: dl.category,
        status: dl.status,
      });
    }
  });

  // Export iCalendar (.ics) RFC-5545 compliant file
  const handleExportICS = () => {
    let icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Business Guardian AI//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:Business Guardian Obligations\r\n`;

    events.forEach((ev, idx) => {
      const cleanDate = ev.date.replace(/-/g, '');
      icsContent += `BEGIN:VEVENT\r\nUID:guardian_${ev.id}_${idx}@businessguardian.ai\r\nDTSTAMP:20261008T120000Z\r\nDTSTART;VALUE=DATE:${cleanDate}\r\nDTEND;VALUE=DATE:${cleanDate}\r\nSUMMARY:${ev.title}\r\nDESCRIPTION:Business Guardian automated watch notification. Category: ${ev.category}\r\nSTATUS:CONFIRMED\r\nEND:VEVENT\r\n`;
    });

    icsContent += `END:VCALENDAR\r\n`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Business_Guardian_Obligations_October_2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const daysInMonth = 31;
  // Oct 1, 2026 is a Thursday (index 4 with Sun=0)
  const firstDayOfWeek = 4;
  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const selectedEvents = events.filter((e) => e.day === selectedDay);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Internal Business Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visual timeline of invoice due dates, document expirations, and regulatory milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportICS}
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            title="Download iCal file for Google Calendar, Outlook, or Apple Calendar"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export .ics Calendar File</span>
          </button>
        </div>
      </div>

      {/* Architecture Readiness Notice */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Future Calendar Sync Architecture:</span>{' '}
          In Version 1, this internal calendar tracks your native business milestones and allows 1-click `.ics` export. Google Calendar and Outlook live sync APIs are architected for Version 2.
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Month Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">October 2026</h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Overdue/Urgent
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Due Date
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Deadline
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 py-2 border-b border-slate-100">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty_${idx}`} className="h-16 bg-slate-50/40 rounded-lg" />;
              }

              const dayEvents = events.filter((e) => e.day === day);
              const isSelected = selectedDay === day;
              const isToday = day === 8;

              return (
                <div
                  key={`day_${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`h-16 sm:h-20 p-1.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : isToday
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]'
                          : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] px-1 py-0.2 rounded truncate font-medium ${
                          ev.type === 'invoice'
                            ? 'bg-amber-100 text-amber-800'
                            : ev.type === 'document'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 block">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Day Events Drawer */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Events for:
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              October {selectedDay}, 2026 {selectedDay === 8 && '(Today)'}
            </h3>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No deadlines or events scheduled on this date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      {ev.category}
                    </span>
                    {ev.amount ? (
                      <span className="font-bold text-slate-900 font-mono">
                        ${ev.amount.toLocaleString()} USD
                      </span>
                    ) : null}
                  </div>
                  <h4 className="font-bold text-slate-900">{ev.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Date: {ev.date}</span>
                    <span className="font-semibold text-slate-700">{ev.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats for Month */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide">
              Month Summary (October 2026):
            </span>
            <div className="flex justify-between text-slate-600">
              <span>Total Scheduled Milestones:</span>
              <span className="font-bold text-slate-900">{events.length}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Invoices Due This Month:</span>
              <span className="font-bold text-slate-900">
                {events.filter((e) => e.type === 'invoice').length}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Document Expirations & Renewals:</span>
              <span className="font-bold text-slate-900">
                {events.filter((e) => e.type === 'document').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
