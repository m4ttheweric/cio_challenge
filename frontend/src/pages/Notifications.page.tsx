import { useNotifications } from '@/api/hooks';
import { Notification, NotificationType } from '@/api/types';
import { HEADER_HEIGHT } from '@/layouts/AppLayout';
import { Alert, Badge, Center, Group, rem, Stack, Text } from '@mantine/core';
import {
   AlertCircleIcon,
   AtSign,
   InfoIcon,
   MessageCircle,
   Smartphone
} from 'lucide-react';
import {
   createMRTColumnHelper,
   MantineReactTable,
   useMantineReactTable
} from 'mantine-react-table';
import { useMemo } from 'react';

const columnHelper = createMRTColumnHelper<Notification>();

const typeIcon: Record<NotificationType, React.ReactNode> = {
   SMS: <MessageCircle size={16} />,
   EMAIL: <AtSign size={16} />,
   PUSH: <Smartphone size={16} />
};
const columns = [
   columnHelper.accessor('title', {
      header: 'Name',
      Cell: ({ row }) => {
         const name = row.original.title;

         return (
            <Stack>
               <Text fw={500}> {name}</Text>
               <Text size='sm' c='dimmed'>
                  {' '}
                  {row.original.description}{' '}
               </Text>
            </Stack>
         );
      }
   }),
   columnHelper.accessor('type', {
      header: 'Type',
      filterFn: (x, q) => x.original.type.includes(q),
      minSize: 50,
      maxSize: 50,
      Cell: ({ row }) => (
         <Group gap='xs'>
            {typeIcon[row.original.type]}
            <Text size='sm' c='dimmed'>
               {row.original.type}
            </Text>
         </Group>
      )
   }),
   columnHelper.accessor('createdAt', {
      header: 'Date',
      minSize: 50,
      maxSize: 50,
      Cell: ({ row }) => {
         const date = new Date(row.original.createdAt);
         return (
            <Text size='sm' c='dimmed'>
               {date.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
               })}
            </Text>
         );
      }
   })
];

export function NotificationsPage() {
   const { data, isFetching, isPending, isError, error } = useNotifications();

   const allTypesAreDisabled =
      data?.preferences.email === false &&
      data?.preferences.push === false &&
      data?.preferences.sms === false;

   const enabledTypes = useMemo(
      () =>
         Object.entries(data?.preferences ?? {})
            .filter(([, v]) => v)
            .map(([k]) => k.toUpperCase()),
      [data?.preferences]
   );

   const table = useMantineReactTable({
      columns,

      data: data?.notifications ?? [],
      layoutMode: 'grid',
      enableColumnFilters: false,
      // container props:
      mantineTableContainerProps: {
         // account for header + toolbar heights (56 x 2)
         mah: `calc(100vh - ${rem(HEADER_HEIGHT + 112)})`
      },

      mantinePaperProps: {
         shadow: 'none',
         withBorder: false,
         radius: 0
      },

      initialState: {
         density: 'xs',
         pagination: { pageSize: 25, pageIndex: 0 }
      },
      enableStickyHeader: true,
      // a space to render content into the header:
      renderTopToolbarCustomActions(props) {
         return (
            <Group mx={8} mt={4}>
               <Text fw={500}>Showing Types:</Text>
               {enabledTypes.map(type => (
                  <Badge>{type}</Badge>
               ))}
            </Group>
         );
      },
      state: {
         isLoading: isPending || isFetching
      }
   });

   if (isError)
      return (
         <Center>
            <Alert icon={<AlertCircleIcon />} w='300' title='Error' color='red'>
               {error.message}
            </Alert>
         </Center>
      );

   if (allTypesAreDisabled) {
      return (
         <Center>
            <Alert title='Alert' my='3rem' icon={<InfoIcon />} maw={400}>
               You have all notification types disabled in your preferences.
               Please enable at least one type to see notifications.
            </Alert>
         </Center>
      );
   }

   return (
      <Stack pos='relative'>
         <MantineReactTable table={table} />
      </Stack>
   );
}
