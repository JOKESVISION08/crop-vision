import React from 'react';
import { BookOpen, ExternalLink, Calendar, ShieldCheck, Search } from 'lucide-react';
import { KnowledgeSource, UserSettings } from '../types';
import { translations } from '../translations';

interface KnowledgeBaseViewProps {
  knowledgeSources: KnowledgeSource[];
  settings: UserSettings;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  knowledgeSources,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const t = translations[settings.language] || translations.en;

  const filteredSources = knowledgeSources.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.disease_or_pest.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.knowledge}</h1>
          <p className="text-sm text-slate-500">Verified agricultural knowledge base (ICAR, TNAU, and plant pathology research guides).</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crop, disease or publication..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSources.map((src) => (
          <div key={src.source_id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {src.crop}
                </span>
                <span className="text-xs text-slate-400 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  {src.publication_date} ({src.document_version})
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{src.title}</h3>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-0.5">Publisher & Region:</span>
                {src.publisher} • {src.region}
              </p>

              <div className="text-xs text-rose-700 font-medium">
                Target Disease/Pest: {src.disease_or_pest}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-800 font-semibold flex items-center">
                <ShieldCheck className="h-4 w-4 mr-1 text-emerald-600" />
                Verified RAG Evidence
              </span>
              <a
                href={src.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1 shadow"
              >
                <span>Read Source</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
