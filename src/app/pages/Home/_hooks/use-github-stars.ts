import { useQuery } from '@tanstack/react-query';

export function useGitHubStars() {
    return useQuery({
        queryKey: ['github-stars'],
        queryFn: async () => {
            const res = await fetch('https://api.github.com/repos/arturbomtempo-dev/reqly');
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            return data.stargazers_count as number;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}
