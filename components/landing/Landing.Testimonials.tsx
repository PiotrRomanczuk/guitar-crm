'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex M.',
    role: 'Jazz Instructor',
    date: 'Today',
    quote:
      'Changed how I run my studio entirely. The interface is beautiful and feels premium. My students actually look forward to checking their notes now.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3EFIkWbGb5Vd2MrPxvG6jKq-IBEusLozFWsWwe_uOzTHokw_ch4dsZdvkmvse7UjGLDH-zlMP5lyuyW4Tj1PfClKNYwztgyQE6D0xutaD5Mq_1LwsKt6S_gJJkKPXgQjsAPmih2wjZsPPOp6p3qRXLpK859Qs8TD657g7ImiZX7zjmEX0YoNxj0bUpyhOs0kCwnErB_S6SO6d08T1Y-CM45wAfTXY4KkHTrM1ejCzj5_Q-oVBxQ8abpi3eJGkT1sIHnuHttyh-B4',
  },
  {
    name: 'Sarah J.',
    role: 'Classical Guitarist',
    date: 'Yesterday',
    quote:
      'Best tool for my students to keep track of their practice. They love the streaks feature, and the song library saves me hours of searching for sheet music.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDELvhFwT7FAvk6vSz8mnAwsPy-dDWqf6SckwUy3aBJnIgd0ddcWmsGCROrbTr0cqdXcBLDi1FRfnfgRbJjjoynj4Y8t61YcGh8MF2-CBRdUTLeyI4C4V0NTkjKpR4NVzWzTA4ScKz1kxOUFXUKNqg94gvoahh6XpDlnCLvjoA6K-2odiDZcgk0FjZxmEhaHmnG4Vt_RdiKDhsG9uAFtESL8ZFftPnEJggVWSpbR_cvLZaOnaqg-byi-4Jw-szzF0F7Un56Anb8Xok',
  },
  {
    name: 'Mike R.',
    role: 'Studio Owner',
    date: '2 days ago',
    quote:
      'Love the wood aesthetic! It feels so premium compared to other sterile apps. It matches the vibe of my luthier workshop perfectly.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDvONQ1f5PLLpDda5A12VCNn66VGfZncis_qdxWKGkWcsUXi_awH7u6tKRhChc_QbsyqX7wGQDgKJlUZF9gkSDjQZyQ0BOXpTv5SZv3-UsU0oElbT1UDJQnVYXEmzOm7f8wlMum2pc8DvK3vV0FagM8mddf5P4r2N0-VYnBLznYI3f0LycXBICR7eAgpd0kjb9FjmJzw5UulOmPkconI7rKp59fwcJrux-wHA1HQlLorbAfNcjGNS3wBUG43no45GcRYfyRwDrbiNc',
  },
];

function TestimonialCard({
  name,
  role,
  date,
  quote,
  avatar,
}: (typeof testimonials)[0]) {
  return (
    <div className="rounded-xl bg-white dark:bg-[#27231c] p-8 border border-amber-200 dark:border-[#3a2e22] flex flex-col gap-6 shadow-lg hover:border-[#ec9c13]/30 transition-colors h-full">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-amber-100 dark:border-[#3a2e22] pb-4">
        <div
          className="h-12 w-12 rounded-full bg-cover bg-center ring-2 ring-amber-200 dark:ring-[#3a2e22]"
          style={{ backgroundImage: `url('${avatar}')` }}
        />
        <div>
          <p className="text-gray-900 dark:text-white font-bold text-base">{name}</p>
          <p className="text-[#d4880f] dark:text-[#ec9c13] text-xs uppercase tracking-wide">{role}</p>
        </div>
        <span className="ml-auto text-xs text-gray-500 dark:text-[#b9af9d] bg-amber-50 dark:bg-[#221b10] px-2 py-1 rounded">
          {date}
        </span>
      </div>

      {/* Quote */}
      <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed italic flex-1">
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}

export function LandingTestimonials() {
  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-[#1c1813] border-t border-amber-100 dark:border-[#2e261d]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Community Voices</h3>
          <p className="text-gray-600 dark:text-[#b9af9d]">Trusted by over 5,000 instructors worldwide.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-1 text-[#ec9c13]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-current" />
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-[#b9af9d]">4.9/5 Average Rating</p>
        </div>
      </div>

      {/* Testimonial cards */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.name} {...testimonial} />
        ))}
      </div>
    </section>
  );
}
