import Image from 'next/image';

export function TestimonialsSection() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mt-6 sm:mt-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
        Trusted by Guitar Teachers
      </h2>
      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-md aspect-video mb-8">
          <Image
            src="/illustrations/testimonials-section--a-friendly-testimonial-illus.png"
            alt="Community of guitar teachers and students"
            fill
            className="object-contain"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
            <p className="text-gray-600 dark:text-gray-300 italic mb-4">
              &quot;This CRM has completely transformed how I manage my guitar students. Scheduling
              is a breeze and I can focus on teaching!&quot;
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3">
                AR
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-semibold">Alex Rivera</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Guitar Teacher</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
            <p className="text-gray-600 dark:text-gray-300 italic mb-4">
              &quot;I love being able to see my upcoming lessons and practice assignments in one
              place. It keeps me motivated.&quot;
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mr-3">
                SM
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-semibold">Sarah Miller</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
